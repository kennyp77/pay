import send from '../../lib/send';
import { ApiResponseSuccess } from '../../types';

import {
    CurrencyCode,
    OrderCart,
    ShippingAddressId,
    OrderMetadata,
    PaymentMethodType,
    ShippingCourierOption,
    ShippingMethodType,
} from './typings';

export interface RenderCartRequest {
    cartId?: string;
    externalId?: string;
    items: Array<{
        productId: string;
        quantity: {
            count: string;
        };
    }>;
    coupons?: Array<{
        value: string;
    }>;
}

export interface RenderOrderRequest {
    merchantId: string;
    currencyCode: CurrencyCode;
    cart: RenderCartRequest;
    shippingAddressId?: ShippingAddressId;
    metadata?: OrderMetadata;
}

export interface RenderOrderResponse {
    currencyCode: CurrencyCode;
    cart: OrderCart;
    merchantId?: string;
    requiredFields?: {
        billingContact?: {
            phone: boolean;
            email: boolean;
            name: boolean;
        };
        shippingContact?: {
            phone: boolean;
            email: boolean;
            name: boolean;
        };
    };
    enableCoupons?: boolean;
    enableCommentField?: boolean;
    availablePaymentMethods?: PaymentMethodType[];
    shipping?: {
        availableCourierOptions?: ShippingCourierOption[];
        availableMethods: ShippingMethodType[];
    };
    metadata?: OrderMetadata;
}

export function renderOrder(
    payload: RenderOrderRequest,
): Promise<ApiResponseSuccess<{ order: RenderOrderResponse }>> {
    const url = '/api/v1/orders/render';

    return send.post(url, { ...payload }, { retry: { limit: 0 } });
}
