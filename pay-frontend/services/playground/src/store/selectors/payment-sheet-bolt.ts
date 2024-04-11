import { encodeMetadata } from '@yandex-pay/playground-data/metadata';
import { PaymentSheetV3 } from '@yandex-pay/sdk/src/typings';
import { createSelector } from 'reselect';

import { State } from 'store/state';
import { getBoltMerchant } from 'utils/get-merchant';
import { getOrderId } from 'utils/order';

import { getPaymentSheet } from './payment-sheet';
import { getStateVersion } from './state-version';

function getMetadata(options: State['options']): any {
    return encodeMetadata({
        currency: options.currency as string,
        order: { value: options.order },
        billingContact: {
            name: options.billingName,
            email: options.billingEmail,
            phone: false,
        },
    });
}

export const getPaymentSheetBolt = createSelector(
    getStateVersion,
    getPaymentSheet,
    (state: State) => state,
    (version, sheet, state) => {
        const paymentSheet: PaymentSheetV3 = {
            version: 3,
            merchantId: getBoltMerchant().id,
            currencyCode: sheet.currencyCode,
            cart: {
                externalId: getOrderId('test-payment-bolt', version),
                items: sheet.order.items.map((item) => ({
                    productId: item.id,
                    total: item.amount,
                    quantity: item.quantity,
                })),
            },
            metadata: getMetadata(state.options),
        };

        return paymentSheet;
    },
);
