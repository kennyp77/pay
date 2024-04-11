import { express } from '@yandex-int/duffman';

import config from '../../configs';
import { getRequestUrl } from '../../helpers/request';
import { counters } from '../helpers/metrika';

import WebCore from './web-core';

export function isAuth(core: WebCore, ignoreNeedReset = false): boolean {
    const { blackbox } = core.req;

    if (!blackbox || blackbox.error !== 'OK') {
        return false;
    }

    if (ignoreNeedReset && blackbox.status === 'NEED_RESET') {
        return true;
    }

    return blackbox.status !== 'NEED_RESET';
}

export function isNeedReset(core: WebCore): boolean {
    const { blackbox } = core.req;

    return blackbox.status === 'NEED_RESET';
}

export const getPassportRedirectUrl = (
    req: express.Request,
    update = false,
    originalUrl?: string,
): string => {
    const returnPath = encodeURIComponent(originalUrl || getRequestUrl(req));

    // NB: Обновляем куку авторизации через редирект,
    // Сейчас так проще и быстрее, в будущем можно сделать запрос фоном
    return `${config.passportAuthUrl}/auth/${
        update ? 'update' : 'list'
    }/?retpath=${returnPath}&origin=${config.passportAuthOrigin}`;
};

export function checkAuth(
    core: WebCore,
    { log = true } = {},
    originalUrl?: string,
): [boolean, string] {
    const { blackbox } = core.req;

    if (isAuth(core)) {
        return [true, ''];
    }

    const canBeReset = isNeedReset(core);

    if (log) {
        if (canBeReset) {
            counters.updateCookieAttempt(core, blackbox.uid);
        } else {
            counters.loginAttempt(core);

            core.logger.warn('Blackbox auth error', {
                uid: blackbox.uid,
                error: blackbox.error,
                status: blackbox.status,
            });
        }
    }

    return [false, getPassportRedirectUrl(core.req, canBeReset, originalUrl)];
}
