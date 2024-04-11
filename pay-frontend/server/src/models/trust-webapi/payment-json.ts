import { flags } from '@yandex-int/duffman';

import BaseCore from '../../core/base-core';
import { ApiError } from '../../errors';

export default async function paymentJson(params: { purchaseToken: string }, core: BaseCore): Promise<any> {
    const method = '/web/payment_json';

    const res = await core
        .service('trust-webapi')(method, params, { method: 'GET' })
        .catch((err) => {
            throw new ApiError(500, method, err.message);
        });

    if (res.status === 'error') {
        if (res.status_desc === 'payment_not_found') {
            throw new ApiError(404, method, res.status_desc);
        }
        throw new ApiError(500, method, res.status_desc);
    }

    return res;
}

paymentJson[flags.NO_AUTH] = true;
paymentJson[flags.NO_CKEY] = true;
