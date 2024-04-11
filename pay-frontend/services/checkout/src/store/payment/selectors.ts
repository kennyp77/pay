import pathOr from '@tinkoff/utils/object/pathOr';
import {
    getAdditionalFields,
    getMerchantId as getMerchantIdHelper,
} from '@trust/utils/payment-sheet';
import { OrderItem, OrderItemType, PaymentMethodType } from '@yandex-pay/sdk/src/typings';
import { createSelector } from 'reselect';

import { RootState } from '..';
import { CASH_KEY } from '../../helpers/payment-method';
import { getActivePaymentId } from '../payment-methods';
import { isPayWithSplit } from '../split';

const getState = (state: RootState) => state.payment;

export const getCashback = createSelector(getState, (state) => state.cashback);

export const getCashbackAmount = createSelector(
    getCashback,
    (cashback) => pathOr(['result', 'amount'], '0', cashback) as string,
);

export const getSheet = createSelector(getState, (state) => state.sheet);

export const getTotalAmount = createSelector(
    getSheet,
    (sheet) => pathOr(['order', 'total', 'amount'], '0', sheet) as string,
);

export const getCurrencyCode = createSelector(
    getSheet,
    (sheet) => pathOr(['currencyCode'], '', sheet) as string,
);

export const getEmail = createSelector(getState, (state) => state.email);

export const getSheetItems = createSelector(
    getSheet,
    (sheet) => pathOr(['order', 'items'], [], sheet) as OrderItem[],
);

export const getShippingTypes = createSelector(
    getSheet,
    (sheet) => pathOr(['requiredFields', 'shippingTypes'], {}, sheet) as Sdk.RequiredShippingTypes,
);

export const isCouponAvailable = createSelector(getSheet, (sheet) => {
    return Boolean(getAdditionalFields(sheet)?.coupons);
});

// TODO: сделать нормализацию payment-sheet'а https://st.yandex-team.ru/YANDEXPAY-2377
export const getSheetItemsSorted = createSelector(getSheetItems, (_items) => {
    const sortOrder: Record<'_' | OrderItemType, number> = {
        _: 0,
        [OrderItemType.Pickup]: 1,
        [OrderItemType.Shipping]: 1,
        [OrderItemType.Discount]: 2,
        [OrderItemType.Promocode]: 3,
    };

    const items = _items.slice();

    items.sort((a: OrderItem, b: OrderItem) => {
        const idxA = sortOrder[a.type || '_'];
        const idxB = sortOrder[b.type || '_'];

        return idxA - idxB;
    });

    return items;
});

export const getMerchantId = createSelector(getSheet, getMerchantIdHelper);

export const getIsSeveralShippingTypes = createSelector(getShippingTypes, (shippingTypes) =>
    Boolean(shippingTypes.direct && shippingTypes.pickup),
);

export const getCheckoutPaymentMethod = createSelector(
    isPayWithSplit,
    getActivePaymentId,
    (isSplitPay, paymentId): PaymentMethodType => {
        if (isSplitPay) {
            return PaymentMethodType.Split;
        }

        return paymentId === CASH_KEY ? PaymentMethodType.Cash : PaymentMethodType.Card;
    },
);
