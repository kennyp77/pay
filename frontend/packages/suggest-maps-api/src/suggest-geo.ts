import { fetcher } from './fetcher';

interface SuggestGeoResponse {
    part: string;
    results: Array<{
        type: string;
        log_id: {
            server_reqid: string;
            pos: number;
            type: string;
            where: {
                name: string;
                source_id: string;
                title: string;
            };
        };
        personalization_info: {
            server_reqid: string;
            pos: 0;
            type: string;
            where: {
                name: string;
                source_id: string;
                title: string;
            };
        };
        title: {
            text: string;
            hl: number[][];
        };
        subtitle: {
            text: string;
            hl: number[][];
        };
        text: string;
        tags: string[];
        action: string;
        uri: string;
        distance: {
            value: number;
            text: string;
        };
    }>;
    suggest_reqid: string;
}

export async function suggestGeo(host: string, query: string): Promise<SuggestGeoResponse> {
    const searchParams = new URLSearchParams({
        callback: '',
        v: '9',
        in: '225',
        search_type: 'addr',
        bases: 'street,house',
        part: query,
    });

    const response = await fetcher(`${host}/suggest-geo?${searchParams}`);

    return response.json();
}
