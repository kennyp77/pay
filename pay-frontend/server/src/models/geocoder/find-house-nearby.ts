import { flags } from '@yandex-int/duffman';
import { get as getProtoSchema } from '@yandex-int/maps-proto-schemas';
import { yandex } from '@yandex-int/maps-proto-schemas/types';
import { loadSync as loadProtoSync } from 'protobufjs';

import BaseCore from '../../core/base-core';

export type GeocoderResponse = yandex.maps.proto.common2.response.Response;

const Kind = yandex.maps.proto.search.kind.Kind;
const Type = 'yandex.maps.proto.common2.response.Response';
const Message = loadProtoSync(getProtoSchema()).lookupType(Type);

type ModelParams = {
    latitude: string;
    longitude: string;
}

type SearchResult = {
    found: boolean,
    coordinates?: {
        latitude: number;
        longitude: number;
    }
    formattedAddress?: string;
    components?: {
        postalCode?: string;
        country?: string;
        province?: string;
        locality?: string;
        street?: string;
        house?: string;
    }
}

const METADATA_PATH = '.yandex.maps.proto.search.geocoder.GEO_OBJECT_METADATA';
const TOPONYM_INFO_PATH = '.yandex.maps.proto.search.geocoder_internal.TOPONYM_INFO';

export default async function findHouseNearby(params: ModelParams, core: BaseCore): Promise<SearchResult> {
    const queryParams = {
        ll: `${params.longitude},${params.latitude}`,
        mode: 'reverse',
        type: 'geo',
        geocoder_kind: 'house',
        // окно поиска дома в градусах
        // на экваторе значение 1,1 соответствует окну с диагональю 157км
        // максимальная диагональ для geocoder_kind=house равна 1км или 0.007
        spn: '0.007,0.007',
        results: '1'
    };

    const protobufResult = await core.service('addrs')('', { query: queryParams });
    const parsed: GeocoderResponse = Message.decode(protobufResult);

    if (Array.isArray(parsed?.reply?.geoObject) && parsed?.reply?.geoObject?.length === 1) {
        const metadata = parsed?.reply?.geoObject?.[0]?.metadata?.[0]?.[METADATA_PATH];

        const searchResult: SearchResult = {
            found: true,
            coordinates: {
                latitude: metadata?.[TOPONYM_INFO_PATH]?.point?.lat,
                longitude: metadata?.[TOPONYM_INFO_PATH]?.point?.lon
            },
            formattedAddress: metadata?.address?.formattedAddress,
            components: {
                postalCode: metadata?.address?.postalCode
            }
        };

        return metadata?.address?.component?.reduce<SearchResult>((acc, curr) => {
            if (curr?.kind?.includes(Kind.COUNTRY)) {
                acc.components.country = curr?.name;
            } else if (curr?.kind?.includes(Kind.PROVINCE)) {
                acc.components.province = curr?.name;
            } else if (curr.kind.includes(Kind.LOCALITY)) {
                acc.components.locality = curr?.name;
            } else if (curr?.kind?.includes(Kind.STREET)) {
                acc.components.street = curr?.name;
            } else if (curr?.kind?.includes(Kind.HOUSE)) {
                acc.components.house = curr?.name;
            }

            return acc;
        }, searchResult) ?? searchResult;
    }

    return { found: false };
}

findHouseNearby[flags.NO_AUTH] = true;
findHouseNearby[flags.NO_CKEY] = true;
