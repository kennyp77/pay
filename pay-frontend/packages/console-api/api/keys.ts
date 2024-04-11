import send from '@trust/pay-api/lib/send';

import { API_CONSOLE_HOST } from '../config';
import { ApiResponseSuccess } from '../types';

interface MerchantKey {
    value?: string;
    created: string;
    keyId: string;
}

interface Response {
    key: MerchantKey;
}

export function createMerchantKey(merchantId: string): Promise<ApiResponseSuccess<Response>> {
    const url = `/api/web/v1/merchants/${merchantId}/keys`;

    return send.post(API_CONSOLE_HOST + url);
}
