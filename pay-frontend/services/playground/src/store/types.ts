import * as Sdk from '@yandex-pay/sdk/src/typings';
import { ButtonOptions, CountryCode, CurrencyCode } from '@yandex-pay/sdk/src/typings';

import { LogRecordOwner } from 'enum/LogRecordOwner';

export interface LogRecord {
    sender: LogRecordOwner;
    receiver?: LogRecordOwner;
    timestamp?: Date;
    timestampDiff?: string;
    message: any;
}

export interface State {
    // State version
    _version: number;

    options: {
        // Options
        country: CountryCode;
        currency: CurrencyCode;
        order: number;
        plus: boolean;
        billingEmail: boolean;
        billingName: boolean;
        cash: boolean;
        split: boolean;
        coupons: boolean;
        t2Badge: boolean;
        chaas: boolean;
        dynamicCart: boolean;
        merchant: number;
        receipt: boolean;

        // Button
        buttonType: ButtonOptions['type'];
        buttonTheme: ButtonOptions['theme'];
        buttonWidth: ButtonOptions['width'];
        buttonNew: '' | 'new-button' | 'new-button--show-empty' | 'new-button--logo-as-text';

        // Shipping
        shipping: boolean;
        shippingAnswer: [number, number];

        // Contact
        shippingContact: number;

        // Pickup
        pickup: boolean;
        pickupSetup: boolean;
        pickupAnswer:
            | 'points_5'
            | 'points_20k'
            | 'equal_points'
            | 'empty'
            | 'no_response'
            | 'error';

        //
    };

    // Available values
    availableOptions: {
        countries: CountryCode[];
        currencies: CurrencyCode[];
        orderOptions: Array<{
            label: string;
            value: number;
            items: Sdk.OrderItem[];
        }>;
        shippingOptions: Array<{
            label: string;
            value: number;
            items?: Sdk.ShippingOption[];
        }>;
        shippingContactOptions: Array<{
            label: string;
            value: number;
            items: Array<Sdk.RequiredShippingContactFields>;
        }>;
        merchantOptions: Array<{
            label: string;
            value: number;
            items: Array<number>;
        }>;
        pickupOptions: Array<{
            label: string;
            value: string;
        }>;
    };

    // Logs
    log: {
        lastRecord: LogRecord | null;
        records: LogRecord[];
    };
}
