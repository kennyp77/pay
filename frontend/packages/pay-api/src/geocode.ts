import { fetcher, FetchResponse } from './fetcher';

export interface GeocodingData {
    results: Array<{
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
    }>;
}

export async function geocode(query: string): Promise<FetchResponse<GeocodingData>> {
    const res = await fetcher.post('/v1/addresses/geocode', JSON.stringify({ text: query }));

    return res.json();
}
