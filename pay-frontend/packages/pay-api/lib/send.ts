import baseFetch, { createInstance, FetchUrl, FetchOptions, FetchRequestData } from '@trust/fetch';

import { addCsrf, addHost, addSessionId, addApiPathFixer, changeCase } from './send-decorators';

const retryOptions = {
    limit: 3,
    methods: ['GET', 'POST'],
    statuses: [408, 429, 500, 502, 503, 504],
    maxTimeout: 30 * 1000,
};

const webApiOptions = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    credentials: 'include' as 'include',
};

const webApiDecorators = [changeCase, addCsrf, addHost, addSessionId, addApiPathFixer];
const fetch = createInstance(webApiOptions, webApiDecorators, baseFetch);

async function get<T>(
    url: FetchUrl,
    searchParams: FetchRequestData = {},
    options: FetchOptions = {},
): Promise<T> {
    const { retry = retryOptions } = options;

    const res = await fetch(url, {
        ...options,
        method: 'GET',
        searchParams,
        retry,
    });

    return res.json<T>();
}

async function post<T>(
    url: FetchUrl,
    body: FetchRequestData = null,
    options: FetchOptions = {},
): Promise<T> {
    const { retry = retryOptions } = options;

    const res = await fetch(url, {
        ...options,
        method: 'POST',
        body,
        retry,
    });

    return res.json<T>();
}

async function put<T>(
    url: FetchUrl,
    body: FetchRequestData = null,
    options: FetchOptions = {},
): Promise<T> {
    const { retry = retryOptions } = options;

    const res = await fetch(url, {
        ...options,
        method: 'PUT',
        body,
        retry,
    });

    return res.json<T>();
}

async function del(url: FetchUrl, options: FetchOptions = {}): Promise<void> {
    const { retry = retryOptions } = options;

    await fetch(url, {
        ...options,
        method: 'DELETE',
        retry,
    });
}

export default { get, post, put, del };
