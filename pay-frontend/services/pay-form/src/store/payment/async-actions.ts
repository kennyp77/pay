import path from '@tinkoff/utils/object/path';
import { logError, timeStart } from '@trust/rum';
import { BankCardId, CardPaymentMethod } from '@trust/utils/payment-methods/typings';
import { wait } from '@trust/utils/promise/wait';
import { redirectTo } from '@trust/utils/url';
import { CheckoutProcess, CheckoutProcessType, ServerApiModule } from '@yandex-pay/pay-common';
import { PaymentMethodType } from '@yandex-pay/sdk/src/typings';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import * as api from '../../api/pay-api';
import { IS_PAY_SERVER, USER_EMAIL, USER_NAME } from '../../config';
import { counters } from '../../counters/metrika';
import { errorReason, errorDetails, isError4xx } from '../../helpers/api-error';
import { checkUnclosedForm } from '../../helpers/app';
import { getBillingRequiredFields } from '../../helpers/required-fields';
import { closeWindow } from '../../helpers/window';
import { FormConnection } from '../../lib/intercom';
import { PayClientApi } from '../../lib/intercom/rpc';
import { AppScreen, AppPending } from '../../typings';
import {
    setPendingAction,
    resetPendingAction,
    setErrorAction,
    setAuth3dsAction,
} from '../app/actions';
import { redirectToAction } from '../app/async-actions';
import { State } from '../index';
import { getPaymentMethodByCardId } from '../user/selectors';

import { changeEmailAction, changeNameAction, setSheetAction } from './actions';
import { getSheet, getTotalAmount, getBillingContact } from './selectors';

const DELAY_TO_SEND_COUNTERS = 1000;

const PAYMENT_TIMEOUT = 10000;

enum RUM_DELTA_NAMES {
    WaitingTransaction = 'waiting.transaction',
    WaitingTransactionError = 'waiting.transaction.error',
}

export const waitForSheetAction =
    () =>
    async (dispatch: ThunkDispatch<State, never, Action>): Promise<void> => {
        const connection = FormConnection.getInstance();

        dispatch(setPendingAction(AppPending.PaymentSheetLoading));

        try {
            let sheet = await PayClientApi.getInstance().waitSheet(PAYMENT_TIMEOUT);

            if (IS_PAY_SERVER) {
                sheet = await ServerApiModule.getInstance().waitSheet(0, sheet);
            } else {
                await api.validate(connection.options.targetOrigin, sheet);
            }

            dispatch(setSheetAction(sheet));

            const emailRequired = getBillingRequiredFields(sheet).email;
            const nameRequired = getBillingRequiredFields(sheet).name;

            if (emailRequired) {
                dispatch(changeEmailAction(USER_EMAIL));
            }

            if (nameRequired) {
                dispatch(changeNameAction(USER_NAME));
            }

            dispatch(redirectToAction(AppScreen.Order));
        } catch (error) {
            logError(error, { fn: 'waitForSheetAction' });

            const errorScreen = isError4xx(error)
                ? AppScreen.PaymentSheetValidatingError
                : AppScreen.PaymentSheetLoadingError;

            dispatch(redirectToAction(errorScreen));

            throw error;
        } finally {
            dispatch(resetPendingAction());
        }
    };

export const checkoutAction =
    (cardId: BankCardId) =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        const connection = FormConnection.getInstance();

        dispatch(setPendingAction(AppPending.Checkout));

        try {
            const state = getState();
            const paymentSheet = getSheet(state);
            const totalAmount = getTotalAmount(state);
            const orderAmount = getTotalAmount(state);
            const billingContact = getBillingContact(state);
            const paymentMethod = getPaymentMethodByCardId(state)(cardId);

            const process = CheckoutProcess.getInstance();

            process.on(CheckoutProcessType.error, (data) => {
                logError(data.error, { fn: 'checkoutAction', type: data.type });
                counters.paymentError({ state: data.state, message: data.error.message });

                if (data.state === 'create_payment') {
                    dispatch(failPaymentService(data.error));
                } else {
                    dispatch(redirectToAction(AppScreen.CheckoutError));
                    dispatch(resetPendingAction());
                }
            });
            process.on(CheckoutProcessType.paymentOrder, () => {
                timeStart(RUM_DELTA_NAMES.WaitingTransaction);
                timeStart(RUM_DELTA_NAMES.WaitingTransactionError);
            });
            process.on(CheckoutProcessType.startServerPayment, () => {
                counters.paymentStart({ amount: orderAmount, payment_method_type: 'card' });
            });
            process.on(CheckoutProcessType.transaction3ds, (data) => {
                counters.checkout3ds({ state: 'start' });

                dispatch(setPendingAction(AppPending.Checkout3ds));
                dispatch(setAuth3dsAction(data));
                dispatch(redirectToAction(AppScreen.Checkout3ds));
            });
            process.on(CheckoutProcessType.transactionStatusChanged, async (data) => {
                if (data.status === 'AUTHORIZED' || data.status === 'CHARGED') {
                    dispatch(redirectToAction(AppScreen.Success));
                    dispatch(resetPendingAction());

                    // NB: Задержка чтобы counters.paymentCheckout успела уйти,
                    //     т.к. после connection.processPayment страница может закрыться
                    //     YANDEXPAY-2400
                    await wait(DELAY_TO_SEND_COUNTERS);

                    connection.successCheckout({
                        orderId: process.order.orderId,
                        metadata: process.order.metadata,
                    });

                    dispatch(completePaymentService());
                }
            });

            process.on(CheckoutProcessType.startClientPayment, () => {
                counters.paymentStart({ amount: orderAmount, payment_method_type: 'card' });
            });

            process.on(CheckoutProcessType.paymentData, async ({ token, paymentMethodInfo }) => {
                counters.paymentCheckout();

                api.updateUserSettings({ cardId });

                // NB: Задержка чтобы counters.paymentCheckout успела уйти,
                //     т.к. после connection.processPayment страница может закрыться
                //     YANDEXPAY-2400
                await wait(DELAY_TO_SEND_COUNTERS);

                connection.processPayment(
                    {
                        token,
                        orderAmount,
                        paymentMethodInfo,
                        billingContact,
                    },
                    paymentSheet.merchant.id,
                );

                dispatch(redirectToAction(AppScreen.Success));
                dispatch(resetPendingAction());
            });

            process.on(CheckoutProcessType.challengeRedirect, (data) => {
                counters.challengeRedirect();

                dispatch(setPendingAction(AppPending.ChallengeRequired));
                redirectTo(data.redirectPath);
            });

            process.startPayment({
                isServerApi: IS_PAY_SERVER,
                sheet: paymentSheet,
                totalAmount,
                paymentMethodType: PaymentMethodType.Card,
                paymentMethod: paymentMethod as CardPaymentMethod,
                billingContact,
                merchantOrigin: connection.options.targetOrigin,
            });
        } catch (error) {
            logError(error, { fn: 'checkoutAction' });

            counters.paymentError({ state: 'create_payment', message: path(['message'], error) });

            dispatch(failPaymentService(error));

            throw error;
        }
    };

export const failPaymentService =
    (error: any) =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        const connection = FormConnection.getInstance();

        dispatch(redirectToAction(AppScreen.CheckoutError));
        dispatch(
            setErrorAction({
                description: 'Произошла ошибка при оплате',
                action: () => connection.formError(errorReason(error), errorDetails(error)),
                actionText: 'Вернуться в магазин',
            }),
        );
        dispatch(resetPendingAction());
    };

export const completePaymentService = () => async (): Promise<void> => {
    closeWindow();
    // NB: Были сообщения о "зависании" окна в незакрытом сосотоянии
    //     Такое поведение тут отслеживается
    checkUnclosedForm('complete_message');
};
