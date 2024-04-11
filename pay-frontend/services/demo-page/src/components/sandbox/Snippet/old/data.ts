import * as Sdk from '@yandex-pay/sdk/src/typings';

import { getMerchant } from '../../../../helpers/merchant';

export const DEFAULT_PAYMENT_SHEET = {
    version: 2,
    env: Sdk.PaymentEnv.Sandbox,
    countryCode: Sdk.CountryCode.Ru,
    currencyCode: Sdk.CurrencyCode.Rub,
    merchant: getMerchant(),
    order: {
        id: `test-order-id-${Date.now()}`,
        total: {
            amount: '40.00',
        },
        items: [
            { label: 'Item A', amount: '15.00' },
            { label: 'Item B', amount: '25.00' },
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
    ],
};

export const DEFAULT_PAYMENT_BUTTON = {
    type: Sdk.ButtonType.Simple,
    theme: Sdk.ButtonTheme.Black,
    width: Sdk.ButtonWidth.Auto,
};
