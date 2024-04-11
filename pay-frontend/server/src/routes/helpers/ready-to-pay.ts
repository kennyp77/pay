import _some from 'lodash/some';

import { PaymentSheet } from '../../typings/common';
import WebCore from '../helpers/web-core';

import { getDisabledInWebviewMerchants } from './bunker';
import { getIsCheckout, getMerchantId } from './payment-sheet';
import { getIsWebView } from './platform';

function isDisabledByBunker(core: WebCore, sheet: PaymentSheet, isWebView: boolean) {
    const disabledMerchants = getDisabledInWebviewMerchants(core.req.bunker);
    const merchantId = getMerchantId(sheet);

    if (isWebView) {
        return _some(disabledMerchants, (item) => item.merchant_id === merchantId);
    }

    return false;
}

function isDisabledByCheckout(core: WebCore, sheet: PaymentSheet, isWebView: boolean) {
    const isCheckout = getIsCheckout(sheet);

    return isWebView && isCheckout;
}

export const isDisabled = (core: WebCore, page: string, sheet: PaymentSheet): boolean => {
    const isWebView = getIsWebView(core.req);
    const logInfo = { byBunker: false, byCheckout: false, isWebView, page };

    if (isDisabledByBunker(core, sheet, isWebView)) {
        logInfo.byBunker = true;

        core.logger.info('READY_TO_PAY', logInfo);

        return true;
    }

    if (isDisabledByCheckout(core, sheet, isWebView)) {
        logInfo.byCheckout = true;

        core.logger.info('READY_TO_PAY', logInfo);

        return true;
    }

    return false;
};
