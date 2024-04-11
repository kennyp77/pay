import BaseCore from '../../core/base-core';
import { ApiError } from '../../errors';
import { isProd } from '../../helpers/common';

type Payload = {
    psp_external_id: string; // gateway from query
    creds: string;
};

export default async function encryptCredentials(
    payload: Payload,
    core: BaseCore,
): Promise<string> {
    const uri = '/api/web/v1/credentials/encrypt';

    const res = await core
        .service('console-webapi')(uri, { ...payload, for_testing: !isProd }, { method: 'POST' })
        .catch((error) => {
            throw new ApiError(error.code, uri, error.message);
        });

    if (res.status === 'fail') {
        throw new ApiError(res.code, uri, res.data.message);
    }

    return res.data.cipher;
}
