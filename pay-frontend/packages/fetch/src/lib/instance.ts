import { FetchFn, FetchDecorator, FetchOptions } from '../types';

const applyDecorators = (fn: FetchFn, decorators: FetchDecorator[]): FetchFn =>
    decorators.reduce((_fn, dec) => dec(_fn), fn);

export default function createInstance(
    defaults: FetchOptions,
    decorators: FetchDecorator[],
    baseFetch: FetchFn,
): FetchFn {
    const fetch = applyDecorators(baseFetch, decorators);

    return ((url, options) => fetch(url, { ...defaults, ...options })) as FetchFn;
}
