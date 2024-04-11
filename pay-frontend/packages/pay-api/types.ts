export type ApiResponseBase<S, T = {}> = {
    code: number;
    status: S;
    data: T;
};

export type ApiResponseSuccess<T = {}> = ApiResponseBase<'success', T>;

export type ApiResponseError<T = {}> = ApiResponseBase<
    'fail',
    T & {
        message: string;
        params?: Record<string, any>;
    }
>;

export type ApiResponse<T = {}> = ApiResponseSuccess<T> | ApiResponseError;
