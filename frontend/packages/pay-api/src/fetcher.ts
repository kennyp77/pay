import { createInstance } from '@yandex-pay/fetcher';

export interface SuccessResponse<T> {
    code: 200;
    data: T;
    status: 'success';
}

export interface FailureResponse {
    code: number;
    data: {
        message: string;
    };
    status: 'fail';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FetchResponse<T = any> = SuccessResponse<T> | FailureResponse;

export const fetcher = createInstance('/api', {
    headers: {
        'X-Csrf-Token': window.__CONFIG.csrfToken,
    },
});
