/*
Типизированый код.
Пока отключил, для уменьшения размера бандла.

import { SdkFrameEmitter } from './emitter';
import { PARENT_ORIGIN, IS_READY_TO_PAY } from './config';

const emitter = SdkFrameEmitter.create(window.parent, PARENT_ORIGIN);
emitter.sdkReady(IS_READY_TO_PAY);
*/

// Метка для RUM
/* eslint-disable import/first */
// @ts-ignore
window.__rum_boot = true;

import { securityReporter } from '@trust/dom-observable';
import { isReadyToPay, defineCsrfToken, defineSessionId } from '@trust/pay-api';
import { logError, logInfo } from '@trust/rum';
import { Experiment } from '@trust/utils/experiment';
import { getOrigin } from '@trust/utils/url';

// @ts-ignore
const cfg = window.__CONFIG || {};

const ENV: any = cfg.env || 'production';
const REQ_ID: any = cfg.reqid || '0';
const PAYMENT_SHEET: any = cfg.paymentSheet || {};
const PARENT_ORIGIN: any = cfg.parentOrigin || {};
const EXPERIMENT: any = cfg.experiment || {};
const IS_DISABLED: any = Boolean(cfg.disabled);
const IS_WEBVIEW: any = Boolean(cfg.webview);
const FRAME_URL_WHITELIST: any = cfg.frameUrlWhitelist || [];

defineCsrfToken(cfg.csrfToken);
defineSessionId(cfg.metrikaSessionId);

function send(type: string, data: Record<string, any>): void {
    if (window.parent && window.parent.postMessage) {
        const message = JSON.stringify({
            payload: { ...data, type },
        });

        window.parent.postMessage(message, getOrigin(PARENT_ORIGIN, '*'));
    }
}

function sendReady(readyToPay: boolean): void {
    send('sdk-ready', { readyToPay, isWebview: IS_WEBVIEW });
}

function sendExp(experiment: Experiment): void {
    send('sdk-exp', experiment);
}

function checkStorages() {
    if (location.search.includes('fromRedirect=1')) {
        ['localStorage', 'sessionStorage'].forEach((key: 'localStorage' | 'sessionStorage') => {
            try {
                const item = window[key].getItem('storage_process_exp_data');

                if (!item) {
                    logInfo(`Value not stored in [${key}] from redirect`);
                }

                window[key].removeItem('storage_process_exp_data');
            } catch (err: any) {
                logInfo(`Read from [${key}] error`, err);
            }
        });
    }
}

(async (): Promise<void> => {
    try {
        checkStorages();

        if (IS_DISABLED) {
            return sendReady(false);
        }

        const res = await isReadyToPay({
            merchantId: PAYMENT_SHEET.merchant.id,
            merchantOrigin: PARENT_ORIGIN,
            paymentMethods: PAYMENT_SHEET.paymentMethods,
            existingPaymentMethodRequired: false,
        });

        return sendReady(res.data.isReadyToPay);
    } catch (err) {
        logError(err);

        return sendReady(false);
    }
})();

sendExp(EXPERIMENT);

securityReporter(FRAME_URL_WHITELIST, { env: ENV, reqId: REQ_ID });
