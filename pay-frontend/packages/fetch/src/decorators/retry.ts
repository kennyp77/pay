import curry from '@tinkoff/utils/function/curry';
import isArray from '@tinkoff/utils/is/array';
import isFunction from '@tinkoff/utils/is/function';
import omit from '@tinkoff/utils/object/omit';

import { FetchHttpError, FetchTimeoutError, FetchHttpIgnoredError } from '../lib/errors';
import {
    FetchFn,
    FetchUrl,
    FetchRequest,
    FetchResponse,
    FetchRetryOptions,
    FetchOptions,
} from '../types';

type RetryDelay = number;
type RetryCounter = number;

interface FetchRetryDelayFn {
    (err: FetchHttpError | FetchTimeoutError, retry: RetryCounter): RetryDelay;
}

const MAX_RETRIES = 5;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const wrapPromise = <T>(promise: Promise<T>, cb: () => void): Promise<T> =>
    promise
        .then((res: T) => {
            cb();

            return res;
        })
        .catch((err: Error) => {
            cb();

            return Promise.reject(err);
        });

/**
 * Воозвращает задержку в ms по экспоненте
 */
const exponentialDelay = (size: number): number => 2 ** (size - 1) * 1000 * 0.5;

/**
 * Возвращает задержку в ms по заголовку Retry-After
 */
function getDelayFromHeader(retryAfterHeader: string): RetryDelay {
    const delay = Number(retryAfterHeader);

    if (Number.isNaN(delay)) {
        return Date.parse(retryAfterHeader) - Date.now() || -1;
    }

    return delay * 1000;
}

/**
 * Вычисление зарержки по retry-параметрам / запросу / ответу
 */
function getDelay(
    options: FetchRetryOptions,
    request: FetchRequest,
    err: FetchHttpError | FetchTimeoutError,
    retry: RetryCounter,
): RetryDelay {
    const { limit = 0, statuses, methods, delay: delayFn } = options;

    if (retry > limit || retry > MAX_RETRIES) {
        return -1;
    }

    if (err instanceof FetchHttpError) {
        const { response } = err;
        const retryAfterHeader = response.headers.get('Retry-After');

        if (
            (isFunction(statuses) && !statuses(response.status)) ||
            (isArray(statuses) && !statuses.includes(response.status))
        ) {
            return -1;
        }

        if (methods && !methods.includes(request.method)) {
            return -1;
        }

        if (retryAfterHeader) {
            return getDelayFromHeader(retryAfterHeader);
        }
    }

    return isFunction(delayFn) ? delayFn(retry) : exponentialDelay(retry);
}

/**
 * Возвращает ограниченный по времени выполнения fetch
 * Прерывает если сработал таймаут
 *
 * Если в опция был передан сингал внешнего аборт-контроллера,
 * то все ретрай-запросы его так же слушают и при необходимости
 * прерывают запрос текущий ретрай-запрос
 */
function getTimeoutFetchFn(
    fn: FetchFn,
    url: FetchUrl,
    options: FetchOptions,
): () => Promise<FetchResponse> {
    const { signal } = options;
    const { maxTimeout } = options.retry;

    return async (): Promise<FetchResponse> => {
        if (!maxTimeout) {
            return fn(url, options);
        }

        let interrupted = false;
        let interruptTimerId: NodeJS.Timeout;
        const clearInterruptTimer = (): void => interruptTimerId && clearTimeout(interruptTimerId);

        return new Promise((resolve, reject) => {
            const abortFetch = (): void => {
                clearInterruptTimer();
                if (!interrupted) {
                    interrupted = true;
                    reject(
                        isFunction(DOMException)
                            ? new DOMException('Abort', 'AbortError')
                            : new Error('Abort: AbortError'),
                    );
                }
            };

            const timeoutFetch = (): void => {
                clearInterruptTimer();
                if (!interrupted) {
                    interrupted = true;
                    reject(new FetchTimeoutError());
                }
            };

            interruptTimerId = setTimeout(timeoutFetch, maxTimeout);

            const fetchP = fn(url, omit(['signal'], options))
                .then((res: FetchResponse) => {
                    clearInterruptTimer();
                    if (interrupted) {
                        return undefined;
                    }

                    return resolve(res);
                })
                .catch((error: Error) => {
                    clearInterruptTimer();
                    if (interrupted) {
                        throw new FetchHttpIgnoredError(error);
                    }

                    return reject(error);
                });

            if (signal) {
                signal.addEventListener('abort', abortFetch);

                return wrapPromise(fetchP, () => signal.removeEventListener('abort', abortFetch));
            }

            return fetchP;
        });
    };
}

// Таймаут на сигналах
// function getTimeoutFetchFn(
//   fn: FetchFn,
//   url: FetchUrl,
//   options: FetchOptions,
// ): () => Promise<FetchResponse> {
//   const { signal } = options;
//   const { maxTimeout } = options.retry;
//
//   return async (): Promise<FetchResponse> => {
//     if (!maxTimeout) {
//       return fn(url, options);
//     }
//
//     const controller = new AbortController();
//     const abortFetch = (): void => controller.abort();
//
//     const fetchP = fn(url, { ...options, signal: controller.signal });
//     const timeoutP = wrapPromise(
//       wait(maxTimeout).then(() => Promise.reject(new FetchTimeoutError())),
//       abortFetch,
//     );
//
//     const raceP = Promise.race([fetchP, timeoutP]) as Promise<FetchResponse>;
//
//     if (signal) {
//       signal.addEventListener('abort', abortFetch);
//
//       return wrapPromise(
//         raceP,
//         () => signal.removeEventListener('abort', abortFetch),
//       );
//     }
//
//     return raceP;
//   };
// }

/**
 * Обертка вокруг fetch добавляющая ретраи
 */
function retryDecorator(fn: FetchFn): FetchFn {
    async function retryFn(
        fetchFn: () => Promise<FetchResponse>,
        delayFn: FetchRetryDelayFn,
        retry = 1,
    ): Promise<FetchResponse> {
        try {
            return await fetchFn();
        } catch (err) {
            if (
                (err instanceof DOMException && err.name === 'AbortError') ||
                (err instanceof Error && err.message === 'Abort: AbortError')
            ) {
                throw err;
            }

            const ms = delayFn(err, retry);

            if (ms < 0) {
                throw err;
            }

            return wait(ms).then(() => retryFn(fetchFn, delayFn, retry + 1));
        }
    }

    return (async (url, options) => {
        if (!options.retry) {
            return fn(url, options);
        }

        const request = { url, ...options };
        const fetchFn = getTimeoutFetchFn(fn, url, options);
        const delayFn = curry(getDelay)(options.retry, request);

        return retryFn(fetchFn, delayFn);
    }) as FetchFn;
}

export default retryDecorator;
