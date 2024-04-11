interface OrderCart {
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
}

interface GeoPoint {
    latitude: number;
    longitude: number;
}

export interface GeoBounds {
    sw: GeoPoint;
    ne: GeoPoint;
}

export interface PickupOption {
    pickupPointId: string;
    title: string;
    provider: string;
    address: string;
    location: GeoPoint;
    amount?: string;
    fromDate?: string;
    toDate?: string;
    storagePeriod?: number;
    phones?: string[];
    description?: string;
    schedule?: Array<{
        toTime: string;
        label: string;
        fromTime: string;
    }>;
}

export interface PickupOptionsRequest {
    merchantId: string;
    boundingBox: GeoBounds;
    cart: OrderCart;
    metadata?: string;
    currencyCode: string;
}

export interface PickupOptionsResponse {
    pickupOptions: PickupOption[];
}

export interface PickupOptionDetailsRequest {
    merchantId: string;
    pickupPointId: string;
    cart: OrderCart;
    metadata?: string;
    currencyCode: string;
}

export interface PickupOptionDetailsResponse {
    pickupOption: PickupOption;
}
