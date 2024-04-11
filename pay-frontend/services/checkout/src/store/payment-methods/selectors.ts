import memoize from '@tinkoff/utils/function/memoize/one';
import { hasCashPaymentMethod } from '@trust/utils/payment-sheet';
import { createSelector } from 'reselect';

import { RootState } from '..';
import { MAX_BOUND_CARDS } from '../../config';
import { CASH_KEY, NEW_CARD_KEY } from '../../helpers/payment-method';

const getState = (state: RootState) => state.paymentMethods;

export const getPaymentMethods = createSelector(getState, (state) => state.list.result || []);

export const getActivePaymentId = createSelector(getState, (state) => state.selectedId);

export const getActivePaymentMethod = createSelector(
    getPaymentMethods,
    getActivePaymentId,
    (methods, selectedId) => methods.find((method) => method.id === selectedId),
);

export const getPaymentMethodById = createSelector(
    getPaymentMethods,
    (methods) => (cardId: Checkout.PaymentMethodId) =>
        methods.find((method) => method.id === cardId),
);

export const getInitialPaymentMethodId = createSelector(getPaymentMethods, (methods) =>
    memoize((sheet: Sdk.PaymentSheet, cardId?: string) => {
        if (hasCashPaymentMethod(sheet) && cardId === CASH_KEY) {
            return cardId;
        }

        const savedCard = methods.find((method) => method.id === cardId);
        const firstEnabled = methods.find((method) => !method.disabled);

        if (savedCard && !savedCard.disabled) {
            return savedCard.id;
        }

        if (firstEnabled) {
            return firstEnabled.id;
        }

        if (methods.length >= MAX_BOUND_CARDS) {
            return methods[0].id;
        }

        return NEW_CARD_KEY;
    }),
);
