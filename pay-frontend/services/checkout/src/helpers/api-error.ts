import pathOr from '@tinkoff/utils/object/pathOr';

export const errorCode = pathOr(['response', 'code'], 0);

export const errorReason = pathOr(['response', 'data', 'message'], 'UNKNOWN_ERROR');

export const errorDetails = pathOr(['response', 'data', 'params'], undefined);

export const isError4xx = (data: any): boolean => {
    const code = errorCode(data);

    // eslint-disable-next-line
    return 400 <= code && code < 500;
};
