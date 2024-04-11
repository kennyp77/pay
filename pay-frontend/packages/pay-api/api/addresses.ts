import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

type AddressId = string;

interface Address {
    id: AddressId;
    ownerService: string;
    type: string;
    zip: string;
    country: string;
    region: string;
    locality: string;
    street: string;
    building: string;
    room: string;
    entrance: string;
    floor: string;
    intercom: string;
    comment: string;
    location: {
        longitude: number;
        latitude: number;
    };
}

type AddressFormData = Omit<
    Address,
    'id' | 'ownerService' | 'zip' | 'location' | 'type' | 'region'
>;

export async function loadAddresses(): Promise<ApiResponseSuccess<{ results: Address[] }>> {
    const url = '/api/v1/addresses';

    return send.get(url);
}

export async function createAddress(
    address: AddressFormData,
): Promise<ApiResponseSuccess<{ address: Address }>> {
    const url = '/api/v1/addresses';

    return send.post(url, address);
}

export async function updateAddress(
    id: AddressId,
    address: AddressFormData,
): Promise<ApiResponseSuccess<{ address: Address }>> {
    const url = `/api/v1/addresses/${id}`;

    return send.put(url, address);
}

export async function deleteAddress(id: AddressId): Promise<void> {
    const url = `/api/v1/addresses/${id}`;

    return send.del(url);
}
