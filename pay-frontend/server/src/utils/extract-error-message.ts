import get from 'lodash/get';
import isObject from 'lodash/isObject';

export function extractErrorMessage(error: any): string {
    if (!error) {
        return '';
    }

    if (!isObject(error)) {
        return `${error}`;
    }

    const errorMsg = get(error, 'error.message', get(error, 'message'));

    return errorMsg || JSON.stringify(error);
}
