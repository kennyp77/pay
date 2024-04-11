import {
    ButtonTheme,
    ButtonType,
    ButtonWidth,
    CountryCode,
    CurrencyCode,
} from '@yandex-pay/sdk/src/typings';

import { orderOptions } from 'data/order';
import { pickupOptions } from 'data/pickup';
import { shippingOptions } from 'data/shipping';

import { stateFromQuery } from '../utils/query';

import { LogRecord, State } from './types';

export const captionLogRecord: LogRecord = {
    // @ts-ignore
    sender: 'Sender',
    // @ts-ignore
    receiver: 'Receiver',
    message: 'Message',
    timestamp: new Date(),
};

export const initialState: State = {
    _version: 1,

    options: stateFromQuery({
        // Options
        country: CountryCode.Ru,
        currency: CurrencyCode.Rub,
        order: 2,
        merchant: 1,
        plus: false,
        billingEmail: false,
        billingName: false,
        cash: false,
        receipt: false,
        split: false,
        t2Badge: false,
        chaas: false,
        dynamicCart: false,

        // Button
        buttonType: ButtonType.Simple,
        buttonTheme: ButtonTheme.Black,
        buttonWidth: ButtonWidth.Auto,
        buttonNew: '',

        // Shipping
        shipping: true,
        shippingAnswer: [1, 2],

        // Shipping Contact
        shippingContact: 1,

        // Pickup
        pickup: true,
        pickupSetup: true,
        pickupAnswer: 'points_5',

        // Coupons
        coupons: false,
    }),

    // Available values
    availableOptions: {
        countries: [CountryCode.Ru, CountryCode.By, CountryCode.Us],
        currencies: [
            CurrencyCode.Rub,
            CurrencyCode.Byn,
            CurrencyCode.Usd,
            CurrencyCode.Eur,
            CurrencyCode.Kzt,
            CurrencyCode.Uah,
            CurrencyCode.Amd,
            CurrencyCode.Gel,
            CurrencyCode.Azn,
            CurrencyCode.Kgs,
            CurrencyCode.Gbp,
            CurrencyCode.Sek,
            CurrencyCode.Pln,
            CurrencyCode.Inr,
            CurrencyCode.Czk,
            CurrencyCode.Cad,
            CurrencyCode.Brl,
            CurrencyCode.Aud,
            CurrencyCode.Uzs,
            CurrencyCode.Chf,
            CurrencyCode.Try,
            CurrencyCode.Cny,
            CurrencyCode.Zar,
            CurrencyCode.Bgn,
            CurrencyCode.Ron,
            CurrencyCode.Hkd,
            CurrencyCode.Aed,
        ],
        merchantOptions: [
            { label: 'Холодильник', value: 1, items: [0] },
            { label: 'Brandshop', value: 2, items: [1] },
            { label: 'Штрафы', value: 3, items: [2] },
            { label: 'Тинькофф', value: 4, items: [3] },
        ],
        orderOptions,
        shippingOptions,
        pickupOptions,
        shippingContactOptions: [
            {
                label: '-',
                value: 1,
                items: [],
            },
            {
                label: 'Имя, почта',
                value: 2,
                items: [
                    {
                        name: true,
                        email: true,
                    },
                ],
            },
            {
                label: 'Имя, почта, телефон',
                value: 3,
                items: [
                    {
                        name: true,
                        email: true,
                        phone: true,
                    },
                ],
            },
        ],
    },
    // Logs
    log: {
        lastRecord: captionLogRecord,
        records: [captionLogRecord],
    },
};

export * from './types';
