import { EXTERNAL_ERROR } from '@yandex-int/duffman/lib/helpers/errors';

export class ApiError extends EXTERNAL_ERROR {
    code: number;

    method: string;

    reason: string;

    constructor(code: number, method: string, reason: string) {
        super({ code, method, reason });

        this.code = code;
        this.method = method;
        this.reason = reason;
    }
}
