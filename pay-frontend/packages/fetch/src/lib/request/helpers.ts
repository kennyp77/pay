import isPlainObject from '@tinkoff/utils/is/plainObject';
// @ts-ignore
import { Headers } from 'whatwg-fetch';

import { FetchUrl, FetchOptions, FetchRequestData } from '../../types';

type FetchBody = string | FormData | URLSearchParams;

function searchParams(params: FetchRequestData): URLSearchParams {
    // @ts-ignore
    return new URLSearchParams(params);
}

export function prepareUrl(url: FetchUrl, params?: FetchOptions['searchParams']): FetchUrl {
    if (!params) {
        return url;
    }

    return url.replace(/(?:\?.*?)?(?=#|$)/, `?${searchParams(params)}`);
}

export function prepareBody(body: FetchOptions['body'], headers: Headers): FetchBody {
    const contentType = headers.get('content-type') || '';
    const isPlainObj = isPlainObject(body);

    if (isPlainObj && contentType.includes('application/x-www-form-urlencode')) {
        return searchParams(body).toString();
    }

    if (isPlainObj) {
        return JSON.stringify(body);
    }

    return body as FetchBody;
}

export function createFakeResponse(url: FetchUrl, error: Error) {
    const statusText = error.name?.includes?.('Error')
        ? `${error.name}: ${error.message}`
        : error.message;

    return {
        ok: false,
        status: -1,
        statusText,
        url,
        headers: new Headers({}),
        json: () => Promise.reject(),
        text: () => Promise.reject(),
    };
}
