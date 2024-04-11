import path from '@tinkoff/utils/object/path';
import { logError, timeStart, timeEnd } from '@trust/rum';
import { CheckoutProcess, CheckoutProcessType } from '@yandex-pay/pay-common';
import { createService } from '@yandex-pay/react-services';
import { PaymentMethodType } from '@yandex-pay/sdk/src/typings';

import { IS_CHECKOUT_SERVER } from 'config';
import { counters } from 'counters';
import { errorDetails, errorReason } from 'helpers/api-error';
import { checkUnclosedForm } from 'helpers/app';
import { NEW_CARD_KEY } from 'helpers/payment-method';
import { closeWindow } from 'helpers/window';
import { FormConnection } from 'lib/intercom';

import { RootState } from '..';
import {
    getBillingContact,
    getCheckoutData,
    getShippingMethodContactData,
    getShippingMethodData,
} from '../mix';
import { getCheckoutPaymentMethod, getSheet, getTotalAmount } from '../payment';
import {
    getActivePaymentId,
    getPaymentMethodById,
    getActivePaymentMethod,
    selectPaymentMethod,
} from '../payment-methods';

import { setPaymentOrder, setPaymentProcessData, setPaymentStage } from './mutators';
import { getPaymentProcessData, getPaymentOrder } from './selectors';
import { PaymentStageType, PaymentFailedAction } from './state';

enum RUM_DELTA_NAMES {
    WaitingTransaction = 'waiting.transaction',
    WaitingTransactionError = 'waiting.transaction.error',
}

export const startPaymentService = createService<RootState, [Checkout.PaymentMethodId?]>(
    function startPaymentService({ dispatch, getState }, selectedPaymentMethodId) {
        const state = getState();

        try {
            const paymentSheet = getSheet(state);
            const totalAmount = getTotalAmount(state);
            const paymentMethodType = getCheckoutPaymentMethod(state);
            const paymentMethodId = selectedPaymentMethodId || getActivePaymentId(state);
            const paymentMethod = selectedPaymentMethodId
                ? getPaymentMethodById(state)(selectedPaymentMethodId)
                : getActivePaymentMethod(state);
            const billingContact = getBillingContact(state);
            const shippingContact = getShippingMethodContactData(state);
            const shippingMethod = getShippingMethodData(state);
            const checkoutData = getCheckoutData(state);

            const process = CheckoutProcess.getInstance();
            const connection = FormConnection.getInstance();

            process.on(CheckoutProcessType.startServerPayment, () => {
                dispatch(setPaymentScreenService());
                counters.paymentStart(totalAmount, paymentMethodType);
            });
            process.on(CheckoutProcessType.error, ({ error, state }) => {
                logError(error, { fn: 'startPaymentService', state: state });
                counters.paymentError({ state: state, message: error.message });

                if (state === 'wait_transaction') {
                    timeEnd(RUM_DELTA_NAMES.WaitingTransactionError);
                }

                if (state === 'create_payment') {
                    dispatch(
                        failPaymentService('', {
                            text: 'Вернуться в магазин',
                            callback: () => {
                                connection.formError(errorReason(error), errorDetails(error));
                            },
                        }),
                    );
                } else {
                    dispatch(failPaymentService());
                }
            });
            process.on(CheckoutProcessType.paymentOrder, (data) => {
                dispatch(setPaymentOrder(data));

                if (paymentMethodType === 'CASH') {
                    counters.paymentCheckout();
                    dispatch(showPaymentInfoService());
                }
            });
            process.on(CheckoutProcessType.startWatchServerPayment, () => {
                timeStart(RUM_DELTA_NAMES.WaitingTransaction);
                timeStart(RUM_DELTA_NAMES.WaitingTransactionError);
            });
            process.on(CheckoutProcessType.transaction3ds, ({ type, ...data }) => {
                counters.checkout3ds({ state: 'start' });

                dispatch(
                    setPaymentStage({
                        type: PaymentStageType.Auth3ds,
                        auth3ds: data,
                    }),
                );
            });
            process.on(CheckoutProcessType.transactionStatusChanged, (data) => {
                if (data.status === 'FAILED') {
                    dispatch(failPaymentService());

                    counters.paymentError({ state: 'wait_transaction', message: 'failed' });
                    timeEnd(RUM_DELTA_NAMES.WaitingTransactionError);
                }

                if (data.status === 'AUTHORIZED' || data.status === 'CHARGED') {
                    counters.paymentCheckout();

                    dispatch(showPaymentInfoService());

                    timeEnd(RUM_DELTA_NAMES.WaitingTransaction);
                }
            });

            process.on(CheckoutProcessType.startClientPayment, () => {
                dispatch(setPaymentScreenService());
                counters.paymentStart(totalAmount, paymentMethodType);
                dispatch(selectPaymentMethod(paymentMethodId));
            });

            process.on(CheckoutProcessType.paymentData, ({ type, ...data }) => {
                const processData = { ...data, ...checkoutData };

                counters.paymentCheckout();

                dispatch(setPaymentProcessData(processData));

                if (
                    data.paymentMethodInfo.type === PaymentMethodType.Split &&
                    data.paymentMethodInfo.splitMeta.checkoutUrl
                ) {
                    dispatch(
                        setPaymentStage({
                            type: PaymentStageType.SplitPayment,
                            splitFrameUrl: data.paymentMethodInfo.splitMeta.checkoutUrl,
                        }),
                    );
                } else {
                    dispatch(setPaymentStage({ type: PaymentStageType.SuccessRedirect }));
                }
            });

            process.on(CheckoutProcessType.challengeRedirect, (data) => {
                dispatch(
                    setPaymentStage({
                        type: PaymentStageType.AuthYa,
                        challengePath: data.redirectPath,
                    }),
                );

                counters.challengeRedirect();
            });

            process.startPayment({
                paymentMethod,
                paymentMethodType,
                isServerApi: IS_CHECKOUT_SERVER,
                sheet: paymentSheet,
                totalAmount,
                shippingContact,
                billingContact,
                merchantOrigin: connection.options.targetOrigin,
                shippingMethod,
            });
        } catch (error) {
            logError(error, { fn: 'startPaymentService' });

            counters.paymentError({ state: 'start_payment', message: path(['message'], error) });

            dispatch(failPaymentService());
        }
    },
);

export const startPaymentProcessService = createService<RootState>(
    function startPaymentProcessService({ getState, dispatch }) {
        const state = getState();
        const needNewCard = getActivePaymentId(state) === NEW_CARD_KEY;

        if (needNewCard) {
            return dispatch(setPaymentStage({ type: PaymentStageType.NewCard }));
        }

        return dispatch(startPaymentService());
    },
);

export const sendPaymentDataService = createService<RootState>(function sendPaymentDataService({
    getState,
    dispatch,
}) {
    try {
        const connection = FormConnection.getInstance();

        if (IS_CHECKOUT_SERVER) {
            const order = getPaymentOrder(getState());

            if (!order) {
                throw new Error('Unable to send checkout success: order not set');
            }

            connection.successCheckout({
                orderId: order.orderId,
                metadata: order.metadata,
            });
        } else {
            const processData = getPaymentProcessData(getState());

            if (!processData) {
                throw new Error('Unable to process payment: processData not set');
            }
            connection.processPayment(processData);
        }
    } catch (error) {
        logError(error, { fn: 'sendPaymentDataService' });

        dispatch(failPaymentService());
    }
});

export const showPaymentInfoService = createService<RootState>(function showPaymentInfoService({
    dispatch,
}) {
    dispatch(setPaymentStage({ type: PaymentStageType.SuccessInfo }));
    dispatch(sendPaymentDataService());
});

export const completePaymentService = createService<RootState>(function completePaymentService() {
    closeWindow();
    // NB: Были сообщения о "зависании" окна в незакрытом сосотоянии
    //     Такое поведение тут отслеживается
    checkUnclosedForm('complete_message');
});

export const failPaymentService = createService<RootState, [string?, PaymentFailedAction?]>(
    function failPaymentService({ dispatch }, reason, action) {
        dispatch(setPaymentStage({ type: PaymentStageType.Failed, reason, action }));
    },
);

export const resetPaymentService = createService<RootState>(function resetPaymentService({
    dispatch,
}) {
    dispatch(setPaymentStage({ type: PaymentStageType.Initial }));

    CheckoutProcess.getInstance().cancelPayment();
});

export const setPaymentScreenService = createService<RootState>(function setPaymentScreenService({
    dispatch,
}) {
    dispatch(setPaymentStage({ type: PaymentStageType.Payment }));
});
