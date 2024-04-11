export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'DELETE';

export type FetchHttpError = Error;

export interface IBaseError extends Error {
    toJSON?: {
        [x: string]: any;
    };
}

export interface FetchTimeoutError extends IBaseError {
    response: Response;
}

export type FetchUrl = string;

export type FetchRequestData =
    | string
    | { [key: string]: string | number | boolean }
    | Record<string, string | number | boolean | object>
    | Array<Array<string | number | boolean>>
    | URLSearchParams;

export interface FetchOptions {
    method?: HttpMethods;
    headers?: HeadersInit | { [key: string]: undefined };
    mode?: RequestMode;
    credentials?: RequestCredentials;
    searchParams?: FetchRequestData;
    body?: FetchRequestData;
    signal?: AbortSignal;

    // Decorators options
    errorByStatus?: (status: number) => boolean;
    retry?: FetchRetryOptions;
}

export type FetchRequest = FetchOptions & { url: FetchUrl };

export interface FetchResponse extends Response {
    arrayBuffer: () => Promise<ArrayBuffer>;
    blob: () => Promise<Blob>;
    formData: () => Promise<FormData>;
    json: <T>() => Promise<T>;
    text: () => Promise<string>;
}

export interface FetchFn {
    (url: FetchUrl, options?: FetchOptions): Promise<FetchResponse>;
}

export type FetchDecorator = (fn: FetchFn) => FetchFn;

export type FetchRetryOptionsFn = (retry: number) => number;

export type FetchRetryOptions = {
    limit?: number;
    methods?: string[];
    statuses?: ((status: number) => boolean) | number[];
    maxTimeout?: number;
    delay?: FetchRetryOptionsFn;
};
