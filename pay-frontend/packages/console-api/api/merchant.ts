import send from '@trust/pay-api/lib/send';

import { API_CONSOLE_HOST } from '../config';
import { ApiResponseSuccess } from '../types';

type ResponseOrigin = {
    created: string;
    origin: string;
    originId: string;
    partnerId: string;
    updated: string;
};

interface CreateMerchantResponse {
    merchant: {
        merchantId: string;
        name: string;
        created: string;
        partnerId: string;
        origins: ResponseOrigin[];
        updated: string;
    };
}

type Origin = {
    origin: string;
};

interface PartnerData {
    contact?: {
        firstName?: string;
        email?: string;
        middleName?: string;
        phone?: string;
        lastName?: string;
    };
    taxRefNumber?: string;
    fullCompanyName?: string;
    ogrn?: string;
    legalAddress?: string;
    postalAddress?: string;
    ceoName?: string;
}

interface RegisterMerchantParams {
    partnerName: string;
    origins: Origin[];
    partnerRegistrationData: PartnerData;
    offerAccepted: boolean;
    callbackUrl: string;
}

interface PartnerResponse {
    registrationData: PartnerData;
    name: string;
    partnerId: string;
    userRole: string;
}

export type GetPartnersData = { partners?: PartnerResponse[] };

export function registerMerchant({
    partnerName,
    origins,
    partnerRegistrationData,
    offerAccepted,
    callbackUrl,
}: RegisterMerchantParams): Promise<ApiResponseSuccess<CreateMerchantResponse>> {
    const url = '/api/web/v1/cms/merchants';

    return send.post(API_CONSOLE_HOST + url, {
        partnerName,
        origins,
        partnerRegistrationData,
        offerAccepted,
        callbackUrl,
    });
}

export function getPartners(): Promise<ApiResponseSuccess<GetPartnersData>> {
    const url = '/api/web/v1/partners';

    return send.get(API_CONSOLE_HOST + url);
}
