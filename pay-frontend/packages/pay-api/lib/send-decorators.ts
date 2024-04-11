import isFunction from '@tinkoff/utils/is/function';
import path from '@tinkoff/utils/object/path';
import { FetchFn, FetchResponse } from '@trust/fetch';
import { toCamelCase } from '@trust/utils/object/to-camel-case';
import { toSnakeCase } from '@trust/utils/object/to-snake-case';

let SESSION_ID = '';
let CSRF_TOKEN = '';
let API_HOST = '';
let API_PATH_FIXER: null | [string, string] = null;

export function defineCsrfToken(csrfToken: string): void {
    CSRF_TOKEN = csrfToken;
}

export function addCsrf(fn: FetchFn): FetchFn {
    const csrfMethods = ['POST', 'PUT', 'DELETE'];

    return ((url, options) => {
        let headers = options.headers || {};

        if (CSRF_TOKEN && csrfMethods.includes(options.method)) {
            headers = { ...headers, 'X-Csrf-Token': CSRF_TOKEN };
        }

        return fn(url, { ...options, headers });
    }) as FetchFn;
}

export function defineHost(apiHost: string): void {
    API_HOST = apiHost;
}

export function addHost(fn: FetchFn): FetchFn {
    return ((url, options) => {
        if (!API_HOST) {
            return fn(url, options);
        }

        return fn(new URL(url, API_HOST).toString(), options);
    }) as FetchFn;
}

export function defineApiPathFixer(pathFixer: [string, string]): void {
    API_PATH_FIXER = pathFixer;
}

export function addApiPathFixer(fn: FetchFn): FetchFn {
    return ((url, options) => {
        if (!API_PATH_FIXER) {
            return fn(url, options);
        }

        const [from, to] = API_PATH_FIXER;

        return fn(url.replace(from, to), options);
    }) as FetchFn;
}

export function changeCase(fn: FetchFn): FetchFn {
    const wrapJson = (res: FetchResponse): FetchResponse => {
        const jsonP = res.json().catch(() => {
            // если в ответе нет данных, будет ошибка JSON.parse, выкидываем объект
            return {};
        });

        res.json = (): any => jsonP.then(toCamelCase);

        return res;
    };

    return (async (url, _options) => {
        const options = _options.body
            ? { ..._options, body: toSnakeCase(_options.body) }
            : _options;

        try {
            const res = await fn(url, options);

            return wrapJson(res);
        } catch (err) {
            if (isFunction(path(['response', 'json'], err))) {
                err.response = wrapJson(err.response);
            }

            throw err;
        }
    }) as FetchFn;
}

export function defineSessionId(sessionId: string): void {
    SESSION_ID = sessionId;
}

export function addSessionId(fn: FetchFn): FetchFn {
    return ((url, options) => {
        let headers = options.headers || {};

        if (SESSION_ID) {
            headers = { ...headers, 'X-Pay-Session-ID': SESSION_ID };
        }

        return fn(url, { ...options, headers });
    }) as FetchFn;
}
