import * as Sdk from '@yandex-pay/sdk/src/typings';
import { CountryCode, CurrencyCode, PaymentSheet } from '@yandex-pay/sdk/src/typings';
import { createSelector } from 'reselect';

import { Cart } from 'helpers/cart';
import { State } from 'store/state';
import { getOptionByValue } from 'utils/available-options';
import { getMerchant } from 'utils/get-merchant';
import { getOrderId } from 'utils/order';

import { getStateVersion } from './state-version';

export const getPaymentSheet = createSelector(
    getStateVersion,
    (state: State) => state,
    (version, state) => {
        const { options, availableOptions } = state;

        const cartItems = getOptionByValue(availableOptions.orderOptions, options.order, []);

        const cart = Cart.fromItems(cartItems, getOrderId('test-classic-', version));

        const merchantIndex = getOptionByValue(
            availableOptions.merchantOptions,
            options.merchant,
            [],
        )[0];

        const paymentMethods: Sdk.PaymentMethod[] = [
            {
                type: Sdk.PaymentMethodType.Card,
                gateway: 'yandex-trust',
                gatewayMerchantId: 'yandex-market',
                allowedAuthMethods: [Sdk.AllowedAuthMethod.PanOnly],
                allowedCardNetworks: [
                    Sdk.AllowedCardNetwork.Visa,
                    Sdk.AllowedCardNetwork.Mastercard,
                    Sdk.AllowedCardNetwork.Mir,
                    Sdk.AllowedCardNetwork.Uzcard,
                ],
            },
        ];

        if (options.chaas) {
            paymentMethods.forEach((method) => {
                if (method.type === Sdk.PaymentMethodType.Card) {
                    method.verificationDetails = true;
                }
            });
        }

        let paymentSheet: PaymentSheet = {
            version: 2,
            countryCode: options.country as CountryCode,
            currencyCode: options.currency as CurrencyCode,
            merchant: getMerchant(merchantIndex),
            order: cart.getOrder(),
            paymentMethods: paymentMethods,
        };

        if (options.plus) {
            paymentSheet.merchant = {
                ...paymentSheet.merchant,
                url: 'https://cashback.test',
            };
        }

        if (options.billingEmail) {
            paymentSheet.requiredFields = {
                billingContact: {
                    ...paymentSheet.requiredFields?.billingContact,
                    email: true,
                },
            };
        }

        if (options.billingName) {
            paymentSheet.requiredFields = {
                billingContact: {
                    ...paymentSheet.requiredFields?.billingContact,
                    name: true,
                },
            };
        }

        if (options.buttonNew) {
            paymentSheet.metadata = JSON.stringify({ newButton: options.buttonNew });
        }

        return paymentSheet;
    },
);
