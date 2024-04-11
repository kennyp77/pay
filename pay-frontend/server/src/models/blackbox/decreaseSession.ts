import { flags } from '@yandex-int/duffman';

import BaseCore from '../../core/base-core';

interface DecreaseSessionResponse {
    error: boolean;
    sessionId?: string;
}

export default async function decreaseSession(
    params: any,
    core: BaseCore,
): Promise<DecreaseSessionResponse> {
    const queryParams = {
        sessionid: core.req.cookies && core.req.cookies.Session_id,
        host: '.yandex.ru',
        userip: core.headers['x-real-ip'] || core.req.ip,
    };

    try {
        const res = await core.service('blackbox-api')('/blackbox', {
            queryParams,
            method: 'decrease_sessionid_lifetime',
        });

        // @ts-ignore
        return { error: false, sessionId: res['new-session'] };
    } catch (error) {
        core.logger.error('Decrease session error', {
            message: error.message || error,
            stack: error.stack,
            queryParams,
        });

        return { error: true };
    }
}

decreaseSession[flags.NO_AUTH] = true;
decreaseSession[flags.NO_CKEY] = true;
