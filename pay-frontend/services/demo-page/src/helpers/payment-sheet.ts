import * as Sdk from '@yandex-pay/sdk/src/typings';

import { getMerchant } from './merchant';

export const getPaymentSheet = (partialSheet: Partial<Sdk.PaymentSheet> = {}): Sdk.PaymentSheet => {
    return {
        ...partialSheet,
        version: 2,
        countryCode: Sdk.CountryCode.Ru,
        currencyCode: Sdk.CurrencyCode.Rub,
        merchant: getMerchant(),
        order: {
            id: 'test-order-id-123',
            total: {
                amount: '40.00',
            },
            items: [
                {
                    label: 'Item A (M)',
                    amount: '15.00',
                },
                {
                    label: 'Item B (Size S)',
                    amount: '25.00',
                },
            ],
        },
        paymentMethods: [
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
            {
                type: Sdk.PaymentMethodType.Cash,
            },
        ],
        requiredFields: {
            billingContact: {
                email: true,
            },
            shippingContact: {
                name: true,
                email: true,
                phone: true,
            },
            shippingTypes: {
                direct: true,
                pickup: true,
            },
        },
    };
};
