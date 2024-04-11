import memoize from '@tinkoff/utils/function/memoize/one';
import { PaymentMethodType } from '@trust/utils/payment-methods/typings';
import { createSelector } from 'reselect';

import { State } from '..';

import { stateIdentifier } from './state';

export const getState = createSelector(
    (state: State) => state,
    (state) => state[stateIdentifier],
);

export const getPaymentMethods = createSelector(getState, (state) => state.paymentMethods);

export const getCashback = createSelector(getState, (state) => state.cashback);

export const getEnabledPaymentMethods = createSelector(getPaymentMethods, (methods) =>
    methods.filter((method) => !method.disabled && method.type !== PaymentMethodType.NewCard),
);

export const getActivePaymentMethodKey = createSelector(
    getState,
    (state) => state.activePaymentMethodKey,
);

export const getActivePaymentMethod = createSelector(
    getPaymentMethods,
    getActivePaymentMethodKey,
    (methods, activeKey) => methods.find((method) => method.key === activeKey),
);

export const getFirstPaymentMethod = createSelector(
    getEnabledPaymentMethods,
    getPaymentMethods,
    (enabledMethods, allMethods) => (enabledMethods.length ? enabledMethods[0] : allMethods[0]),
);

export const getPaymentMethodByCardId = createSelector(getPaymentMethods, (methods) =>
    memoize((cardId: string) => {
        return methods.find(
            (method) => method.type === PaymentMethodType.Card && method.id === cardId,
        );
    }),
);

export const getSavedUserCard = createSelector(getState, (state) => state.savedCard);
