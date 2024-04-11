import baseFetch, { createInstance } from '@trust/fetch';

import { normalizeGeoSuggest } from '../api-transform/addresses';
import { API_GEO_HOST } from '../config';

const fetch = createInstance({}, [], baseFetch);

export interface GeoSuggestItem {
    text: string;
    tags: string[];
    title: {
        text: string;
        hl: [] | [number, number];
    };
    subtitle: {
        text: string;
        hl: [] | [number, number];
    };
}

export interface GeoSuggestResponse {
    part: string;
    results: Array<GeoSuggestItem>;
}

export interface GeoSuggestOptions {
    searchType: 'any' | 'street' | 'house';
    n?: number;
}

const getBases = (options: Omit<GeoSuggestOptions, 'n'>): string => {
    if (options.searchType === 'any') {
        return 'geo';
    }

    return options.searchType === 'street' ? 'street,no_house' : 'street,house';
};

export async function geoSuggest(
    query: Checkout.SearchAddressQuery,
    options: GeoSuggestOptions,
): Promise<GeoSuggestResponse> {
    const url = new URL('/suggest-geo', API_GEO_HOST).toString();
    const searchParams = {
        callback: '',
        v: '9',
        n: options.n || 5,
        in: '225',
        fullpath: '1',
        search_type: options.searchType === 'any' ? 'all' : 'addr',
        bases: getBases(options),
        part: query,
    };

    const res = await fetch(url, { method: 'GET', searchParams });
    const response = await res.json<GeoSuggestResponse>();

    if (Array.isArray(response.results)) {
        return {
            part: response.part || '',
            results: response.results.map(normalizeGeoSuggest),
        };
    }

    return {
        part: response.part || '',
        results: [],
    };
}
