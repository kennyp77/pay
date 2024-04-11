import send from '@trust/pay-api/lib/send';

import { API_CONSOLE_HOST } from '../config';
import { ApiResponseSuccess } from '../types';

interface Response {
    pspId: string;
    revision?: number;
    merchantId: string;
    integrationId?: string;
    created?: string;
    updated?: string;
    status?: string;
    forTesting?: boolean;
}

interface CreateMerchantIntegrationParams {
    pspExternalId: string;
    status?: string;
    creds?: string;
    encrypted?: boolean;
    forTesting?: boolean;
}

export function createMerchantIntegration(
    merchantId: string,
    payload: CreateMerchantIntegrationParams,
): Promise<ApiResponseSuccess<Response>> {
    const url = `/api/web/v1/merchants/${merchantId}/integrations`;

    return send.post(API_CONSOLE_HOST + url, { ...payload });
}
