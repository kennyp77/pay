import { flags } from '@yandex-int/duffman';

import BaseCore from '../../core/base-core';
import { ApiError } from '../../errors';

type Payload = {
    merchant_origin: string;
    merchant_id: string;
    existing_payment_method_required: boolean;
    payment_methods: any[];
};

export default async function isReadyToPay(payload: Payload, core: BaseCore): Promise<boolean> {
    const uri = '/api/v1/is_ready_to_pay';

    const res = await core
        .service('pay-webapi')(uri, payload, { method: 'POST' })
        .catch((err) => {
            throw new ApiError(err.code, uri, err.message);
        });

    if (res.status === 'fail') {
        throw new ApiError(res.code, uri, res.data.message);
    }

    return res.data.is_ready_to_pay;
}

isReadyToPay[flags.NO_AUTH] = true;
isReadyToPay[flags.NO_CKEY] = true;
