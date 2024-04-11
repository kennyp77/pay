export type CurrencyCode =
    | 'RUB'
    | 'BYN'
    | 'USD'
    | 'EUR'
    | 'KZT'
    | 'UAH'
    | 'AMD'
    | 'GEL'
    | 'AZN'
    | 'KGS'
    | 'GBP'
    | 'SEK'
    | 'PLN'
    | 'INR'
    | 'CZK'
    | 'CAD'
    | 'BRL'
    | 'AUD'
    | 'UZS'
    | 'CHF'
    | 'TRY'
    | 'CNY'
    | 'ZAR'
    | 'BGN'
    | 'RON'
    | 'HKD'
    | 'AED';

export type PaymentMethodType = 'CARD' | 'SPLIT' | 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY';

export type ShippingMethodType = 'COURIER' | 'PICKUP' | 'YANDEX_DELIVERY';

export interface Location {
    latitude: number;
    longitude: number;
}

export type Price = string;

export type OrderMetadata = string;

export type CouponStatus = 'VALID' | 'INVALID' | 'EXPIRED';

export type TransactionStatus = 'NEW' | 'AUTHORIZED' | 'CHARGED' | 'THREEDS_CHALLENGE' | 'FAILED';

export interface Coupon {
    value: string;
    status: CouponStatus;
    description: string;
}

export type ShippingAddressId = string;
export type ShippingContactRequest = string;

export interface OrderPaymentMethod {
    cardNetwork?: string;
    cardLast4?: string;
    methodType: PaymentMethodType;
}

export interface Measurements {
    width?: number;
    height?: number;
    length?: number;
    weight?: number;
}

export interface OrderCartTotal {
    label?: string;
    amount: Price;
}

export interface Discount {
    description: string;
    discountId: string;
    amount: Price;
}

export interface OrderItemQuantity {
    count: string;
    available?: string;
    label?: string;
}

export interface OrderItem {
    title?: string;
    measurements?: Measurements;
    total: Price;
    unitPrice?: Price;
    subtotal?: Price;
    productId: string;
    discountedUnitPrice?: Price;
    quantity: OrderItemQuantity;
    receipt?: {
        title?: string;
        tax: number;
        measure: number;
    };
}

export interface OrderCart {
    cartId: string;
    externalId?: string;
    items: OrderItem[];
    measurements?: Measurements;
    coupons?: Coupon[];
    discounts?: Discount[];
    total?: OrderCartTotal;
}

export interface Schedule {
    label: string;
    fromTime: string;
    toTime: string;
}

export interface ShippingPickupOption {
    title: string;
    description?: string;
    location: Location;
    phones?: string[];
    pickupPointId: string;
    fromDate?: string;
    schedule?: Schedule[];
    toDate?: string;
    storagePeriod?: number;
    amount?: Price;
    provider: string;
    address: string;
}

export interface ShippingCourierOption {
    courierOptionId: string;
    title: string;
    amount: Price;
    toTime?: string;
    category: string;
    fromDate: string;
    toDate?: string;
    provider: string;
    fromTime?: string;
}

export interface Shipping {
    yandexDeliveryOption?: {
        yandexDeliveryOptionId: string;
        amount: Price;
    };
    pickupOption?: ShippingPickupOption;
    methodType: ShippingMethodType;
    courierOption?: ShippingCourierOption;
}

export interface Contact {
    secondName?: string;
    lastName?: string;
    id?: string;
    email?: string;
    phone?: string;
    firstName?: string;
}

export interface ShippingAddress {
    region?: string;
    locale?: string;
    locality: string;
    street: string;
    id?: string;
    floor?: string;
    location?: Location;
    comment?: string;
    room?: string;
    zip?: string;
    entrance?: string;
    building: string;
    country: string;
    intercom?: string;
}
