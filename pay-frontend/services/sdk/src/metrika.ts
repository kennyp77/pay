import pathOr from '@tinkoff/utils/object/pathOr';
import * as metrikaApi from '@trust/metrika-api';

import { BUILD_VERSION } from './config';
import { InitPaymentSheet, CompleteReason, SdkAgent, PaymentType } from './typings';

const merchantOrigin = window.location.origin;
const sheetMerchantId = pathOr(['merchant', 'id'], 'noid');
const sheetMerchantName = pathOr(['merchant', 'name'], 'noname');
const sheetMerchantUrl = pathOr(['merchant', 'url'], 'nourl');
const sheetOrderId = pathOr(['order', 'id'], 'noid');
const sheetCurrency = pathOr(['currencyCode'], '');
const sheetAmount = pathOr(['order', 'total', 'amount'], '');
const sheetVersion = pathOr(['version'], 0);
const hasBillingContact = pathOr(['requiredFields', 'billingContact'], false);
const hasShippingContact = pathOr(['requiredFields', 'shippingContact'], false);
const hasShippingAddress = pathOr(['requiredFields', 'shippingTypes', 'direct'], false);
const hasPickupAddress = pathOr(['requiredFields', 'shippingTypes', 'pickup'], false);
const bool2str = (val: any) => String(!!val);

let LAST_SHEET: InitPaymentSheet;

const TS_MAP: Record<string, number> = {};

const _params = (
    ids: string[],
    name: string,
    data: Record<string, any> = {},
): Record<string, any> => {
    const [session, checkout] = ids;

    const params = checkout
        ? { [checkout]: { [name]: { ...data, datetime: Date.now() } } }
        : { [name]: { ...data, datetime: Date.now() } };

    return {
        origin: merchantOrigin,
        [session]: params,
    };
};

const _callByTimeout = (ms: number, cb: Sys.CallbackFn1<any>) => {
    let timeoutId: null | NodeJS.Timeout = null;

    const callback = (error?: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
            cb(error);
        }
    };

    timeoutId = setTimeout(() => callback('timeout'), ms);

    return callback;
};

export function init(counterId: string, counterUrl: string, ymUid: string): void {
    const params = {
        pageUrl: merchantOrigin,
        hostname: window.location.hostname,
        // NB: Важно для склейки логов в Метрике
        //     Без единого id, могут не проклеиваться
        ymUid,
    };

    metrikaApi.init(counterId, params, counterUrl);
}

export function setExperiments(experiments: string): void {
    metrikaApi.setExperiments(experiments);
}

export function getParamsIds(sheet: InitPaymentSheet, counter?: number): string[] {
    const sheetId = [sheetMerchantId(sheet), sheetOrderId(sheet)].join('__');

    if (!TS_MAP[sheetId]) {
        TS_MAP[sheetId] = Date.now();
    }

    const sessionId = [sheetId, TS_MAP[sheetId]].join('__');
    const checkoutId = counter ? `click-${counter}` : '';

    return checkoutId ? [sessionId, checkoutId] : [sessionId];
}

export const counters = {
    meta: (sheet: InitPaymentSheet, type: PaymentType, agent?: SdkAgent): void => {
        const ids = getParamsIds(sheet);
        if (LAST_SHEET) {
            // NB: Важно проверить сценарий с множественными кнопками на странице
            metrikaApi.goal('multi_buttons_page');
        }

        LAST_SHEET = sheet;

        const data = {
            type,
            merchant_id: sheetMerchantId(sheet),
            merchant_origin: merchantOrigin,
            merchant_name: sheetMerchantName(sheet),
            merchant_url: sheetMerchantUrl(sheet),
            currency: sheetCurrency(sheet),
            amount: sheetAmount(sheet),
            version: sheetVersion(sheet),
            datetime: sheetVersion(sheet),
            agent: agent || { name: '', version: '' },
            checkout: type === 'checkout',
            form_billing_contact: bool2str(hasBillingContact(sheet)),
            form_shipping_contact: bool2str(hasShippingContact(sheet)),
            form_shipping_address: bool2str(hasShippingAddress(sheet)),
            form_pickup_address: bool2str(hasPickupAddress(sheet)),
            build_version: BUILD_VERSION,
        };

        metrikaApi.view(window.location.origin);
        metrikaApi.count(_params(ids, 'meta', data));
    },

    paymentSkip: (sheet: InitPaymentSheet): void => {
        const ids = getParamsIds(sheet);

        metrikaApi.count(_params(ids, 'payment_skip'));
    },

    paymentInit: (sheet: InitPaymentSheet): void => {
        const ids = getParamsIds(sheet);

        metrikaApi.count(_params(ids, 'payment_init'));
    },

    paymentComplete: (sheet: InitPaymentSheet, reason: CompleteReason): void => {
        const ids = getParamsIds(sheet);

        metrikaApi.count(_params(ids, 'payment_complete', { reason }));
    },

    paymentCheckout: (sheet: InitPaymentSheet, counter: number): void => {
        const ids = getParamsIds(sheet, counter);

        metrikaApi.count(_params(ids, 'pay_button_click'));
    },

    paymentProcess: (
        sheet: InitPaymentSheet,
        maxDelay: number,
        _callback: Sys.CallbackFn1<string>,
    ): void => {
        const ids = getParamsIds(sheet);
        const callback = _callByTimeout(maxDelay, _callback);

        metrikaApi.count(_params(ids, 'payment_process'), {}, callback);
    },

    buttonRender: (options: Record<string, any>): void => {
        metrikaApi.goal('pay_button_render');

        if (LAST_SHEET) {
            const path = getParamsIds(LAST_SHEET);

            metrikaApi.count(_params(path, 'pay_button_render', options));
        }
    },

    buttonLoad: (options: Record<string, any>): void => {
        if (LAST_SHEET) {
            const path = getParamsIds(LAST_SHEET);

            metrikaApi.count(_params(path, 'pay_button_load', options));
        }
    },

    emptyPaymentData: (): void => {
        metrikaApi.goal('empty_payment_data', { origin: window.location.origin });
    },

    webviewWithFrame: (sheet: InitPaymentSheet): void => {
        const ids = getParamsIds(sheet);

        metrikaApi.count(_params(ids, 'webview_with_frame'));
    },
};
