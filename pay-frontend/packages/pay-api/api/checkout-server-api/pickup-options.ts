import { GeoBounds, GeoPoint, Price } from '@yandex-pay/sdk/src/typings';

import send from '../../lib/send';
import { ApiResponseSuccess } from '../../types';

import { RenderCartRequest } from './order-render';
import { CurrencyCode } from './typings';

interface PickupOptionSchedule {
    toTime: string;
    label: string;
    fromTime: string;
}

export interface PickupOption {
    location: GeoPoint;
    title: string;
    toDate?: string;
    address: string;
    amount?: Price;
    schedule?: PickupOptionSchedule[];
    provider: string;
    pickupPointId: string;
    phones?: string[];
    description?: string;
    fromDate?: string;
    storagePeriod?: number;
}

export interface PickupOptionsResponse {
    pickupOptions: PickupOption[];
}

interface PickupOptionsRequest {
    merchantId: string;
    boundingBox: GeoBounds;
    cart: RenderCartRequest;
    metadata?: string;
    currencyCode: CurrencyCode;
}

interface PickupOptionDetailsRequest {
    merchantId: string;
    cart: RenderCartRequest;
    pickupPointId: string;
    metadata?: string;
    currencyCode: CurrencyCode;
}

export interface PickupOptionDetailsResponse {
    pickupOption: PickupOption;
}

export function loadPickupOptions(
    payload: PickupOptionsRequest,
): Promise<ApiResponseSuccess<PickupOptionsResponse>> {
    const url = '/api/v1/pickup-options';

    return send.post(url, { ...payload }, { retry: { limit: 0 } });
}

export function loadPickupOptionDetails(
    payload: PickupOptionDetailsRequest,
): Promise<ApiResponseSuccess<PickupOptionDetailsResponse>> {
    const url = '/api/v1/pickup-option-details';

    return send.post(url, { ...payload }, { retry: { limit: 0 } });
}
