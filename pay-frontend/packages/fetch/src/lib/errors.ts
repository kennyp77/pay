// eslint-disable-next-line max-classes-per-file
import {
    FetchHttpError as FetchHttpErrorI,
    FetchTimeoutError as FetchTimeoutErrorI,
    HttpMethods,
} from '../types';

export class FetchTimeoutError extends Error implements FetchHttpErrorI {
    constructor() {
        super('FetchTimeoutError');

        // @see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(this, FetchTimeoutError.prototype);
    }
}

export class FetchHttpIgnoredError extends Error implements FetchHttpErrorI {
    constructor(error: Error) {
        super(`FetchHttpIgnoredError: "${error.name} - ${error.message}"`);

        // @see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(this, FetchTimeoutError.prototype);
    }
}

interface IFetchHttpErrorSerialized {
    url: string;
    status: number;
    statusText: string | null;
    method: HttpMethods;
    requestId: string | null;
}

interface IFetchErrorExtra {
    method: HttpMethods;
}

export class FetchHttpError extends Error implements FetchTimeoutErrorI {
    url: string;

    status: number;

    method: HttpMethods;

    response: Response;

    constructor(response: Response, extra?: IFetchErrorExtra) {
        const message =
            response.statusText ||
            (response.status === 0 || response.status
                ? String(response.status)
                : 'Unknown response error');

        super(message);

        // @see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(this, FetchHttpError.prototype);

        this.name = 'FetchError';
        this.url = response.url;
        this.status = response.status;
        this.method = extra?.method;
        this.response = response;
    }

    toJSON(): IFetchHttpErrorSerialized {
        const { url, status, method, response } = this;
        const statusText = response.statusText;
        const requestId = response.headers.get('x-request-id');

        return {
            url,
            status,
            statusText,
            method,
            requestId,
        };
    }
}
