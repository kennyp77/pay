import path from '@tinkoff/utils/object/path';
import { FetchHttpError } from '@trust/fetch';
import { logError } from '@trust/rum';

type ApiErrorResponse = {
    status: 'fail';
    code: number;
    data: {
        message: string;
    };
};

class ApiError extends Error {
    public response: ApiErrorResponse;

    constructor(response: ApiErrorResponse) {
        super(response.data.message);

        this.response = response;
    }
}

const sendError = (err: Error): void => {
    // TODO: Временное решение, нужно разобраться почему RUM стреляет
    try {
        logError('fetch_error', err);
    } catch (_err) {
        console.error(_err);
    }
};

export async function handleError(err: Error | FetchHttpError): Promise<ApiErrorResponse> {
    const getDataMessage = path(['data', 'message']);
    let response: ApiErrorResponse = {
        status: 'fail',
        code: 500,
        data: { message: 'UNKNOWN_ERROR' },
    };

    sendError(err);

    if (err instanceof FetchHttpError) {
        try {
            // NB: Если отдали не JSON тут будет ошибка
            const maybeResponse = await err.response.json();

            if (maybeResponse.status && maybeResponse.code && getDataMessage(maybeResponse)) {
                response = maybeResponse;
            }
        } catch (error) {
            sendError(error);
        }
    }

    throw new ApiError(response);
}
