import { encodeMetadata } from '@yandex-pay/playground-data/metadata';
import { PaymentSheetV3 } from '@yandex-pay/sdk/src/typings';
import { createSelector } from 'reselect';

import { State } from 'store/state';
import { getOptionByValue } from 'utils/available-options';
import { getBoltMerchant } from 'utils/get-merchant';
import { getOrderId } from 'utils/order';

import { getCheckoutSheet } from './checkout-sheet';
import { getStateVersion } from './state-version';

function getMetadata(availableOptions: State['availableOptions'], options: State['options']): any {
    const shippingContactOption = getOptionByValue(
        availableOptions.shippingContactOptions,
        options.shippingContact,
        [],
    );
    const shippingContact = shippingContactOption[0] || {};

    return encodeMetadata({
        currency: options.currency as string,
        order: { value: options.order },
        billingContact: {
            name: options.billingName,
            email: options.billingEmail,
            phone: false,
        },
        shippingContact: {
            name: shippingContact.name || false,
            email: shippingContact.email || false,
            phone: shippingContact.phone || false,
        },
        paymentMethods: {
            cash: options.cash,
            split: options.split,
        },
        coupons: {
            enabled: options.coupons,
        },
        shipping: {
            enabled: options.shipping,
            values: options.shippingAnswer,
        },
        pickup: {
            enabled: options.pickup,
            value: options.pickupAnswer,
        },
        receipt: {
            enabled: options.receipt,
        },
    });
}

export const getCheckoutSheetBolt = createSelector(
    getStateVersion,
    getCheckoutSheet,
    (state: State) => state,
    (version, sheet, state) => {
        const checkoutSheet: PaymentSheetV3 = {
            version: 3,
            merchantId: getBoltMerchant().id,
            currencyCode: sheet.currencyCode,
            cart: {
                externalId: getOrderId('test-checkout-bolt', version),
                items: sheet.order.items.map((item) => ({
                    productId: item.id,
                    total: item.amount,
                    quantity: item.quantity,
                })),
            },
            metadata: getMetadata(state.availableOptions, state.options),
        };

        return checkoutSheet;
    },
);
