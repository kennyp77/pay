import pathOr from '@tinkoff/utils/object/pathOr';
import { getRequiredBillingFields } from '@trust/utils/payment-sheet';
import { BillingContactInfo, OrderItem } from '@yandex-pay/sdk/src/typings';
import { createSelector } from 'reselect';

import { State } from '..';

import { stateIdentifier } from './state';

export const getState = createSelector(
    (state: State) => state,
    (state) => state[stateIdentifier],
);

export const getSheet = createSelector(getState, (state) => state.sheet);

export const getTotalAmount = createSelector(
    getSheet,
    (sheet) => pathOr(['order', 'total', 'amount'], '0', sheet) as string,
);

export const getOrderItems = createSelector(
    getSheet,
    (sheet) => pathOr(['order', 'items'], [], sheet) as OrderItem[],
);

export const getCurrencyCode = createSelector(
    getSheet,
    (sheet) => pathOr(['currencyCode'], '', sheet) as string,
);

export const getUserEmail = createSelector(getState, (state) => state.email);

export const getUserName = createSelector(getState, (state) => state.name);

export const getBillingContact = createSelector(
    getSheet,
    getUserEmail,
    getUserName,
    (paymentSheet, userEmail, userName) => {
        const billingFields = getRequiredBillingFields(paymentSheet);

        const billingContact: BillingContactInfo = {};

        if (billingFields && billingFields.email) {
            billingContact.email = userEmail;
        }

        if (billingFields && billingFields.name) {
            billingContact.name = userName;
        }

        return billingContact;
    },
);
