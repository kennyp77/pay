export interface OrderCoupon {
    value: string;
    status: 'VALID' | 'INVALID' | 'EXPIRED';
    description?: string;
}

export interface OrderItem {
    productId: string;
    total: string;
    unitPrice?: string;
    discountedUnitPrice?: string;
    subtotal?: string;
    title?: string;
    quantity: {
        count: string;
        available?: string;
        label?: string;
    };

    measurements?: {
        weight?: number;
        height?: number;
        length?: number;
        width?: number;
    };
    receipt?: {
        title?: string;
        tax: number;
        measure: number;
    };
}

export interface OrderTotal {
    amount: string;
    label?: string;
}

export interface OrderCart {
    items: OrderItem[];

    coupons?: OrderCoupon[];

    discounts?: Array<{
        discountId: string;
        amount: string;
        description: string;
    }>;

    total: OrderTotal;

    measurements?: {
        weight?: number;
        height?: number;
        length?: number;
        width?: number;
    };
}

export interface ShippingItem {
    courierOptionId: string;
    provider: 'YANDEX' | 'COURIER' | 'CDEK' | 'EMS';
    category: 'EXPRESS' | 'TODAY' | 'STANDARD';
    title: string;
    amount: string;
    fromDate?: string;
    toDate?: string;
    fromTime?: string;
    toTime?: string;
}

export interface RenderOrderRequest {
    merchantId: string;
    currencyCode: string;
    cart: {
        cartId: string;
        externalId: string;
        items: Array<{
            productId: string;
            quantity: {
                count: string;
            };
        }>;

        coupons?: Array<{
            value: string;
        }>;
    };

    shippingAddress?: {
        country?: string;
        region?: string;
        regionHierarchy?: unknown[];
        locality?: string;
        street?: string;
        building?: string;
        room?: string;
        entrance?: string;
        floor?: string;
        intercom?: string;
        zip?: string;
        locale?: string;
        comment?: string;
        location?: {
            longitude?: number;
            latitude?: number;
        };
    };

    metadata: string;
}

export interface RenderOrderResponse {
    currencyCode: string;
    availablePaymentMethods: Array<'CARD' | 'SPLIT' | 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY'>;
    enableCoupons?: boolean;
    enableCommentField?: boolean;

    requiredFields: {
        billingContact: {
            name: boolean;
            email: boolean;
            phone: boolean;
        };
        shippingContact: {
            name: boolean;
            email: boolean;
            phone: boolean;
        };
    };

    cart: OrderCart;

    shipping: {
        availableMethods: Array<'COURIER' | 'PICKUP' | 'YANDEX_DELIVERY'>;
        availableCourierOptions?: Array<ShippingItem>;
    };

    metadata?: string;
}

export type Coupon = { value: string };
export type PayloadItem = { productId: string };
