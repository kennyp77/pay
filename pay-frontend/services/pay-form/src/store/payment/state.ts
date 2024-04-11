import { PaymentSheet, CountryCode, CurrencyCode } from '@yandex-pay/sdk/src/typings';

export interface PaymentState {
    sheet: PaymentSheet;
    email: string;
    name: string;
}

export const stateIdentifier = 'payment';

export const createState = (): PaymentState => ({
    sheet: {
        version: NaN,
        countryCode: CountryCode.Ru,
        currencyCode: CurrencyCode.Rub,
        merchant: {
            id: '',
            name: '',
        },
        order: {
            id: '',
            total: { amount: '0' },
            items: [],
        },
        paymentMethods: [],
    },
    email: '',
    name: '',
});
