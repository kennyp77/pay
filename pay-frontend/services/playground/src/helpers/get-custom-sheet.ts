import * as Sdk from '@yandex-pay/sdk/src/typings';

import { AppearanceMetadata } from '../features/buttons-list/custom-button';
import { getMerchantMatchesName } from '../utils/get-merchant';

const getBaseSheet = () => {
    const paymentSheet: Sdk.PaymentData = <Sdk.PaymentData>{};

    paymentSheet.env = Sdk.PaymentEnv.Sandbox;
    paymentSheet.version = 2;
    paymentSheet.countryCode = Sdk.CountryCode.Ru;
    paymentSheet.currencyCode = Sdk.CurrencyCode.Rub;
    paymentSheet.merchant = getMerchantMatchesName('merchant');
    paymentSheet.order = {
        id: 'test-order-id',
        total: {
            amount: '4200.00',
        },
        items: [
            { id: 'A', label: 'Item A', amount: '1500.00' },
            { id: 'B', label: 'Item B', amount: '2700.00' },
        ],
    };
    paymentSheet.paymentMethods = [
        {
            type: Sdk.PaymentMethodType.Card,
            gateway: 'yandex-trust',
            gatewayMerchantId: 'yandex-market',
            allowedAuthMethods: [Sdk.AllowedAuthMethod.PanOnly],
            allowedCardNetworks: [
                Sdk.AllowedCardNetwork.Visa,
                Sdk.AllowedCardNetwork.Mastercard,
                Sdk.AllowedCardNetwork.Mir,
                Sdk.AllowedCardNetwork.Maestro,
                Sdk.AllowedCardNetwork.VisaElectron,
            ],
        },
    ];

    return paymentSheet;
};

const makeMetadataFromFlags = ({
    showCard,
    showAvatar,
    extra,
}: AppearanceMetadata): string | undefined => {
    const testingFlags: {
        hidePersonal: string[];
        fall?: true;
    } = {
        hidePersonal: [],
    };
    if (!showAvatar) {
        testingFlags.hidePersonal.push('AVATAR');
    }
    if (!showCard) {
        testingFlags.hidePersonal.push('CARD');
    }
    if (extra === 'fall') {
        testingFlags.fall = true;
    }
    if (testingFlags.hidePersonal.length > 0 || testingFlags.fall) {
        return JSON.stringify(testingFlags);
    }
};

export const getCustomSheet = (options: AppearanceMetadata) => {
    const sheet = getBaseSheet();
    const { additionalOption, extra } = options;

    if (extra === 'bills') {
        sheet.merchant = getMerchantMatchesName('bills');
    } else if (additionalOption.split) {
        sheet.merchant = getMerchantMatchesName('split');
        sheet.paymentMethods.push({ type: Sdk.PaymentMethodType.Split });
    }
    if (additionalOption.cashback) {
        sheet.merchant.url = 'https://cashback.test';
    }

    sheet.metadata = makeMetadataFromFlags(options);

    return sheet;
};
