import pick from '@tinkoff/utils/object/pick';

import { GeoSuggestItem } from '../api/geo-suggest';
import { loadAddresses, createAddress } from '../api/pay-api';

type ApiAddress = Sys.Return<typeof createAddress>['data']['address'];

function parseAddress(address: ApiAddress): Checkout.Address {
    return {
        id: address.id,
        ownerService: address.ownerService ?? '',
        type: address.type ?? '',
        zip: address.zip ?? '',
        country: address.country ?? '',
        region: address.region ?? '',
        locality: address.locality ?? '',
        street: address.street ?? '',
        building: address.building ?? '',
        room: address.room ?? '',
        entrance: address.entrance ?? '',
        floor: address.floor ?? '',
        intercom: address.intercom ?? '',
        comment: address.comment ?? '',
        location: {
            latitude: address.location?.latitude ?? 0,
            longitude: address.location?.longitude ?? 0,
        },
    };
}

export function addressItem(res: Sys.Return<typeof createAddress>): Checkout.Address {
    return parseAddress(res.data.address);
}

export function addressesList(res: Sys.Return<typeof loadAddresses>): Checkout.Address[] {
    return res.data.results.map(parseAddress);
}

export const toShippingAddress = (address: Checkout.Address): Sdk.ShippingAddress =>
    pick(
        [
            'country',
            'region',
            'locality',
            'street',
            'building',
            'room',
            'entrance',
            'floor',
            'intercom',
            'zip',
            'location',
        ],
        address,
    );

export const toShippingMethodDataAddress = (
    address: Checkout.Address,
): Checkout.ShippingMethodDataAddress => pick(['id', 'country', 'locality', 'region'], address);

export const normalizeGeoSuggest = (suggest: GeoSuggestItem): GeoSuggestItem => ({
    text: suggest.text || '',
    tags: Array.isArray(suggest.tags) ? suggest.tags : [],

    title: {
        text: suggest.title?.text || '',
        hl:
            Array.isArray(suggest.title?.hl) && suggest.title.hl.length === 2
                ? suggest.title.hl
                : [],
    },
    subtitle: {
        text: suggest.subtitle?.text || '',
        hl:
            Array.isArray(suggest.subtitle?.hl) && suggest.subtitle.hl.length === 2
                ? suggest.subtitle.hl
                : [],
    },
});
