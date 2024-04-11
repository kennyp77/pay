import isFunction from '@tinkoff/utils/is/function';

import { FetchHttpError } from '../lib/errors';
import { FetchFn } from '../types';

export interface ErrorByStatusFn {
    (status: number): boolean;
}

function errorByStatusDecorator(fn: FetchFn): FetchFn {
    return (async (url, options) => {
        const { errorByStatus } = options;
        const res = await fn(url, options);

        // eslint-ignore-next-line yoda
        if (isFunction(errorByStatus) && errorByStatus(res.status)) {
            throw new FetchHttpError(res, {
                method: options.method,
            });
        }

        return res;
    }) as FetchFn;
}

export default errorByStatusDecorator;
