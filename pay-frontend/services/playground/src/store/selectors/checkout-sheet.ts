import clone from '@tinkoff/utils/clone';
import * as Sdk from '@yandex-pay/sdk/src/typings';
import { createSelector } from 'reselect';

import { State } from 'store/state';
import { getOptionByValue } from 'utils/available-options';
import { getOrderId } from 'utils/order';

import { getPaymentSheet } from './payment-sheet';
import { getStateVersion } from './state-version';

export const getCheckoutSheet = createSelector(
    getStateVersion,
    getPaymentSheet,
    (state: State) => state,
    (version, basePaymentSheet, state) => {
        const { options, availableOptions } = state;
        const paymentSheet = clone(basePaymentSheet);

        paymentSheet.order.id = getOrderId('test-checkout-', version);

        const shippingContact = getOptionByValue(
            availableOptions.shippingContactOptions,
            options.shippingContact,
            [],
        )[0];

        if (shippingContact) {
            paymentSheet.requiredFields = {
                ...paymentSheet.requiredFields,
                shippingContact,
            };
        }

        if (options.cash) {
            paymentSheet.paymentMethods.push({ type: Sdk.PaymentMethodType.Cash });
        }

        if (options.split) {
            paymentSheet.paymentMethods.push({ type: Sdk.PaymentMethodType.Split });
        }

        if (options.shipping) {
            paymentSheet.requiredFields = {
                ...paymentSheet.requiredFields,
                shippingTypes: {
                    ...paymentSheet.requiredFields?.shippingTypes,
                    direct: true,
                },
            };
        }

        if (options.pickup) {
            paymentSheet.requiredFields = {
                ...paymentSheet.requiredFields,
                shippingTypes: {
                    ...paymentSheet.requiredFields?.shippingTypes,
                    pickup: true,
                },
            };
        }

        if (options.coupons) {
            paymentSheet.additionalFields = {
                ...paymentSheet.additionalFields,
                coupons: true,
            };
        }

        return paymentSheet;
    },
);
