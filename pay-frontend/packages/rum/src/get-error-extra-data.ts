import { IBaseError } from '@trust/fetch';

export function getErrorExtraData(error?: IBaseError) {
    if (typeof error?.toJSON !== 'function') {
        return {};
    }

    return error.toJSON();
}
