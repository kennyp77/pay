import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

interface Response {
    isReadyToPay: boolean;
}

interface IsReadyToPayParams {
    merchantId: string;
    merchantOrigin: string;
    paymentMethods: any;
    existingPaymentMethodRequired?: boolean;
}

export function isReadyToPay(params: IsReadyToPayParams): Promise<ApiResponseSuccess<Response>> {
    const url = '/api/v1/is_ready_to_pay';

    const { merchantId, merchantOrigin, paymentMethods = null, existingPaymentMethodRequired = false } = params;

    return send.post(url, {
        merchantId,
        merchantOrigin,
        paymentMethods,
        existingPaymentMethodRequired,
    });
}
