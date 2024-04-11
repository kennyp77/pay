// Метка для RUM
/* eslint-disable import/first */
// @ts-ignore
window.__rum_boot = true;

import { isReadyToPay, defineCsrfToken } from '@trust/pay-api';
import { logError } from '@trust/rum';
import { getOrigin } from '@trust/utils/url';
import { ReadyToPayCheckOptions } from '@yandex-pay/sdk/src/typings';

// @ts-ignore
const cfg = window.__CONFIG || {};
const IS_AUTH: any = Boolean(cfg.isAuth);
const IS_DISABLED: any = Boolean(cfg.disabled);
const IS_WEBVIEW: any = Boolean(cfg.webview);
const PARENT_ORIGIN: any = cfg.parentOrigin || {};
const CHECK_OPTIONS = (cfg.checkOptions || {}) as ReadyToPayCheckOptions;

defineCsrfToken(cfg.csrfToken);

function send(type: string, data: Record<string, any>): void {
    if (window.parent && window.parent.postMessage) {
        const message = JSON.stringify({
            payload: { ...data, type },
        });

        window.parent.postMessage(message, getOrigin(PARENT_ORIGIN, '*'));
    }
}

function sendReady(readyToPay: boolean): void {
    send('sdk-ready-check', { readyToPay, isWebview: IS_WEBVIEW });
}

(async (): Promise<void> => {
    try {
        if (!IS_AUTH || IS_DISABLED) {
            return sendReady(false);
        }

        const res = await isReadyToPay({
            merchantId: CHECK_OPTIONS.merchantId,
            merchantOrigin: PARENT_ORIGIN,
            paymentMethods: CHECK_OPTIONS.paymentMethods,
            existingPaymentMethodRequired: CHECK_OPTIONS.checkActiveCard,
        });

        return sendReady(res.data.isReadyToPay);
    } catch (err) {
        logError(err);

        return sendReady(false);
    }
})();
