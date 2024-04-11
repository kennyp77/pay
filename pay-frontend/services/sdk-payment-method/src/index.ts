// Метка для RUM
/* eslint-disable import/first */
// @ts-ignore
window.__rum_boot = true;

import { securityReporter } from '@trust/dom-observable';
import { logError } from '@trust/rum';
import { InitPaymentSheet } from '@yandex-pay/sdk/src/typings';

import { loadCashback, loadActiveCard, getTele2Cashback, getSplitAvailable } from './api';
import { getButtonType } from './button-type';
import { ENV, REQ_ID, PAYMENT_SHEET, FRAME_URL_WHITELIST, FALL_FLAG } from './config';
import { onPaymentUpdate, sendFailure, sendReady } from './connection';
import { render } from './render';

async function run(paymentSheet: void | InitPaymentSheet): Promise<void> {
    if (ENV !== 'production' && FALL_FLAG) {
        return;
    }

    try {
        const [card, cashback, tele2Cashback, splitAvailable] = await Promise.all([
            loadActiveCard(paymentSheet),
            loadCashback(paymentSheet),
            getTele2Cashback(paymentSheet),
            getSplitAvailable(paymentSheet),
        ]);

        const buttonType = getButtonType({ hasCard: Boolean(card), hasSplit: splitAvailable });

        render(buttonType, card, tele2Cashback || cashback);

        sendReady(buttonType);
    } catch (err) {
        logError(err);
        sendFailure();
    }
}

run(PAYMENT_SHEET);

onPaymentUpdate(run);

securityReporter(FRAME_URL_WHITELIST, { env: ENV, reqId: REQ_ID });
