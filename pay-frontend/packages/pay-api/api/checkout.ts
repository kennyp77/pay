import { PaymentMethodType, ShippingType } from '@yandex-pay/sdk/src/typings';

import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

interface CheckoutResponse {
    paymentToken: string;
    paymentMethodInfo: {
        type: string;
        cardLast4?: string;
        cardNetwork?: string;
    };
}

interface CheckoutRequest {
    merchantOrigin: string;
    cardId?: string;
    sheet: any;
    paymentMethodType: PaymentMethodType;
    challengeReturnPath?: string;

    shippingMethod?: {
        type: ShippingType;
        direct?: {
            id?: string;
            provider?: string;
            category?: string;
            amount?: string;
            address: {
                id: string;
                country: string;
                region: string;
                locality: string;
            };
        };
        pickup?: {
            id: string;
            provider?: string;
            amount: string;
            address: {
                formatted: string;
                location: {
                    longitude: number;
                    latitude: number;
                };
            };
        };
    };

    shippingContact?: {
        id?: string;
    };
}

export function checkout(payload: CheckoutRequest): Promise<ApiResponseSuccess<CheckoutResponse>> {
    const url = '/api/v1/checkout';

    return send.post(url, { ...payload });
}
