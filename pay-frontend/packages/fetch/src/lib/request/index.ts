// @ts-ignore
import { Headers } from 'whatwg-fetch';

import { FetchFn, FetchResponse } from '../../types';

import { prepareBody, prepareUrl, createFakeResponse } from './helpers';

const request: FetchFn = async function requestFn(baseUrl, options = {}): Promise<FetchResponse> {
    const { method = 'GET' } = options;

    const headers = new Headers(options.headers);
    const url = prepareUrl(baseUrl, options.searchParams);
    const body = prepareBody(options.body, headers);

    try {
        return await fetch(url, {
            method,
            headers,
            body,
            credentials: options.credentials,
            signal: options.signal,
            mode: options.mode,
        });
    } catch (e) {
        return createFakeResponse(url, e) as unknown as Response;
    }
};

export default request;
