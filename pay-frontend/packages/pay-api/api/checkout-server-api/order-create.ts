import send from '../../lib/send';
import { ApiResponseSuccess } from '../../types';

import {
    CurrencyCode,
    OrderCart,
    Price,
    OrderPaymentMethod,
    Shipping,
    ShippingAddressId,
    ShippingContactRequest,
    OrderMetadata,
    PaymentMethodType,
    Contact,
    ShippingCourierOption,
    ShippingMethodType,
    ShippingAddress,
} from './typings';

export interface CreateOrderRequest {
    merchantId: string;
    currencyCode: CurrencyCode;
    cart: OrderCart;
    paySessionId?: string;
    orderAmount?: Price;
    paymentMethod?: OrderPaymentMethod;
    shippingMethod?: Shipping;
    shippingAddressId?: ShippingAddressId;
    shippingContactId?: ShippingContactRequest;
    billingContact?: Contact;
    metadata?: OrderMetadata;
}

export interface CreateOrderResponse {
    orderId: string;
    checkoutOrderId: string;
    created?: string;
    paymentMethod?: OrderPaymentMethod;
    billingContact?: Contact;
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
    cart: OrderCart;
    availablePaymentMethods?: PaymentMethodType[];
    paymentStatus?: string;
    shipping?: {
        availableCourierOptions?: ShippingCourierOption[];
        availableMethods: ShippingMethodType[];
    };
    merchantId?: string;
    currencyCode: CurrencyCode;
    shippingAddress?: ShippingAddress;
    reason?: string;
    enableCoupons?: boolean;
    orderAmount?: Price;
    shippingMethod: Shipping;
    enableCommentField?: boolean;
    updated?: string;
    metadata?: OrderMetadata;
    shippingContact?: Contact;
}

export function createOrder(
    payload: CreateOrderRequest,
): Promise<ApiResponseSuccess<{ order: CreateOrderResponse }>> {
    const url = '/api/v1/orders/create';

    return send.post(url, { ...payload }, { retry: { limit: 0 } });
}
