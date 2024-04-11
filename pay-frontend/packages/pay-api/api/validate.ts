import send from '../lib/send';
import { ApiResponse } from '../types';

type ValidateResponse = {};

export function validate(
    merchantOrigin: string,
    sheet: any,
): Promise<ApiResponse<ValidateResponse>> {
    const url = '/api/v1/validate';

    return send.post(url, { merchantOrigin, sheet });
}
