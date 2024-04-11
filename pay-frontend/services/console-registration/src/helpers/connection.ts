import { logError } from '@trust/rum';

import { YAPAY_MESSAGE_TYPE, YAPAY_ERROR_TYPE, YAPAY_MESSAGE_SOURCE } from '../config';

import { toMerchantDataMessage } from './merchantData';

type MessageType = typeof YAPAY_MESSAGE_TYPE | typeof YAPAY_ERROR_TYPE;

const send = (data: Record<string, any> & { type: MessageType }) => {
    const opener = window.top && window.top.opener;

    if (!opener || opener === window || opener === window.top) {
        logError('The parent window is not available');

        return;
    }

    if (!opener.postMessage) {
        logError('The PostMessage is not available');

        return;
    }

    opener.postMessage(JSON.stringify(data), '*');
};

export const sendError = (error: string) => {
    send({ source: YAPAY_MESSAGE_SOURCE, type: YAPAY_ERROR_TYPE, error });
};

export const sendMerchantData = (
    merchantId: string,
    merchantName: string,
    keyId: string,
    keyValue: string,
) => {
    send(toMerchantDataMessage({ merchantId, merchantName, keyId, keyValue }));
};
