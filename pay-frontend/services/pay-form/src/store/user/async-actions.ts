import fromPairs from '@tinkoff/utils/object/fromPairs';
import pick from '@tinkoff/utils/object/pick';
import { logError } from '@trust/rum';
import {
    CardPaymentMethod,
    PaymentMethod,
    PaymentMethodType,
    UserCard,
} from '@trust/utils/payment-methods/typings';
import { sortUserCards } from '@trust/utils/payment-methods/user-card';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import * as api from '../../api/pay-api';
import { MAX_BOUND_CARDS } from '../../config';
import { counters } from '../../counters/metrika';
import {
    getPaymentMethodsByUserCards,
    createNewCardPaymentMethod,
    findNewPaymentMethod,
} from '../../helpers/payment-method';
import { getDisabledCardsIds } from '../../helpers/user-card';
import { AppPending, AppScreen } from '../../typings';
import { setPendingAction, resetPendingAction } from '../app/actions';
import { redirectToAction } from '../app/async-actions';
import { State } from '../index';
import { getSheet } from '../payment/selectors';

import {
    setPaymentMethodsAction,
    setActivePaymentMethodKeyAction,
    resetActivePaymentMethodKeyAction,
    setCashbackAction,
    setUserCardAction,
} from './actions';
import {
    getPaymentMethods,
    getActivePaymentMethod,
    getFirstPaymentMethod,
    getSavedUserCard,
} from './selectors';

const prepareCounterData = (methods: PaymentMethod[]): any => {
    const toPairsFrom1 = (arr: any[]): Array<[number, any]> =>
        arr.map((data, idx) => [idx + 1, data]);

    return fromPairs(toPairsFrom1(methods.map(pick(['id', 'system', 'issuer', 'disabled']))));
};

export const redirectToNewCardAction =
    () =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        const paymentMethods = getPaymentMethods(getState());

        if (
            paymentMethods.find((paymentMethod) => paymentMethod.type === PaymentMethodType.NewCard)
        ) {
            dispatch(setPendingAction(AppPending.CardBindingFormLoading));
            dispatch(redirectToAction(AppScreen.BindCard));
        }
    };

export const loadCashbackAction =
    (cardId?: string) =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        try {
            const { payment } = getState();

            const response = await api.getCashback({ sheet: payment.sheet, cardId });

            dispatch(setCashbackAction(response.data.cashback));
        } catch (error) {
            logError(error, { fn: 'loadCashbackAction' });

            throw error;
        }
    };

export const setActivePaymentMethodAction =
    (paymentMethod: PaymentMethod | null, options: { skipSave?: boolean } = {}) =>
    async (dispatch: ThunkDispatch<State, never, Action>): Promise<void> => {
        if (paymentMethod && paymentMethod.type === PaymentMethodType.NewCard) {
            return dispatch(redirectToNewCardAction());
        }

        if (paymentMethod) {
            counters.paymentMethodSelect(pick(['id'], paymentMethod));

            dispatch(setActivePaymentMethodKeyAction(paymentMethod.key));
            dispatch(loadCashbackAction((paymentMethod as CardPaymentMethod).id));

            if (!options.skipSave) {
                api.updateUserSettings({ cardId: (paymentMethod as CardPaymentMethod).id });
            }
        } else {
            dispatch(resetActivePaymentMethodKeyAction());
        }

        return dispatch(redirectToAction(AppScreen.Order));
    };

export const refreshPaymentMethodsAction =
    () =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        dispatch(setPendingAction(AppPending.PaymentMethodsLoading));

        try {
            const savedCardId = getSavedUserCard(getState());
            const response = await api.userCards();
            const cards = sortUserCards(response.data.cards as UserCard[], savedCardId);

            const disabledCardsIds = getDisabledCardsIds(cards, getSheet(getState()));

            const paymentMethods = getPaymentMethodsByUserCards(cards, disabledCardsIds);

            if (paymentMethods.length < MAX_BOUND_CARDS) {
                paymentMethods.push(createNewCardPaymentMethod());
            }

            counters.paymentMethods(prepareCounterData(paymentMethods));
            dispatch(setPaymentMethodsAction(paymentMethods));
        } catch (error) {
            logError(error, { fn: 'refreshPaymentMethodsAction' });

            dispatch(redirectToAction(AppScreen.PaymentMethodsLoadingError));

            throw error;
        } finally {
            dispatch(resetPendingAction());
        }
    };

export const selectBindedPaymentMethodAction =
    (cardId: string) =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        try {
            await api.syncUserCard(cardId, { polling: true });

            let state = getState();
            const oldPaymentMethods = getPaymentMethods(state);

            await dispatch(refreshPaymentMethodsAction());

            state = getState();

            const newPaymentMethod = findNewPaymentMethod(
                oldPaymentMethods,
                getPaymentMethods(state),
            );

            // NB: Не нашли новую карту после рефреша — странная ситуация
            if (!newPaymentMethod) {
                logError('New payment method not loaded');
            }

            const nextPaymentMethod = newPaymentMethod || getActivePaymentMethod(state);

            // NB: У пользователя 0 карт, и после добавления новая не появилась, ходим по кругу
            if (!nextPaymentMethod) {
                logError('User without cards after binding');
            }

            const setPaymentMethod = nextPaymentMethod || getFirstPaymentMethod(state);

            dispatch(setActivePaymentMethodAction(setPaymentMethod));
        } catch (error) {
            logError(error, { fn: 'selectBindedPaymentMethodAction' });

            dispatch(redirectToAction(AppScreen.PaymentMethodsLoadingError));

            throw error;
        }
    };

export const loadUserStateAction =
    () =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        try {
            const { data } = await api.loadUserSettings();

            dispatch(setUserCardAction(data.userSettings.cardId));
        } catch (error) {
            logError(error, { fn: 'loadUserStateAction' });
        }
    };
