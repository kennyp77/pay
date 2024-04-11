import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

interface Geocode {
    room: string;
    locality: string;
    entrance: string;
    building: string;
    country: string;
    street: string;
    zip: string;
    formatted_address: string;
    house_precision: string;
    latitude: number;
    longitude: number;
}

export function loadAddressGeocode(query: string): Promise<ApiResponseSuccess<Geocode>> {
    const url = '/api/v1/addresses/geocode';

    return send.post(url, { text: query });
}
