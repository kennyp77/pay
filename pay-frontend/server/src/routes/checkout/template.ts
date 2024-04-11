import { Csrf } from '@yandex-int/csrf';
import userRenderer from '@yandex-lego/serp-header/dist/base/user2.desktop';

import config from '../../configs';
import { getFramesSrc } from '../../configs/csp/presets';
import { LaasLocation } from '../../typings/common';
import { getEnv } from '../../utils';
import {
    getUID,
    getUserEmail,
    getUserFirstName,
    getUserLastName,
    getAvatarId,
    hasUserPhone,
} from '../helpers/blackbox';
import { isUserForFF } from '../helpers/ff-users';
import { metrikaCheckoutId, metrikaSessionId } from '../helpers/metrika';
import { isSplitAvailable } from '../helpers/split';
import WebCore from '../helpers/web-core';

type ClientConfig = Record<string, any>;

let api2Csrf: Csrf;
const api2CsrfKey = getEnv('CSRF_KEY_API2', '');

if (api2CsrfKey) {
    api2Csrf = new Csrf({ key: api2CsrfKey });
}

export const getUserTemplate = (core: WebCore): string => {
    const { req } = core;
    const { blackbox, cookies } = core.req;

    /**
     * TODO: Add the tld and lang values from the user agent header.
     */
    return userRenderer.getContent({
        tld: 'ru',
        lang: 'ru',
        bundleKey: 'base',
        nonce: req.nonce || '',
        ctx: {
            uid: blackbox.uid,
            yu: cookies.yandexuid,
            name: blackbox.displayName,
            avatarId: getAvatarId(blackbox),
            avatarHost: config.avatarUrl,
            platform: 'desktop',
            noCounter: true,
            retpath: `${req.protocol}://${req.hostname}${req.originalUrl}`,
            passportHost: config.passportAuthUrl,
            accountsUrl: `${config.services.passport.url}/accounts`,
            service: 'custom-items',
            allowedActions: ['exit'], // оставляем только кнопку выхода
            customFooter: '', // убираем футер с кнопками помощи и настроек
        },
    });
};

export const getClientConfig = (
    core: WebCore,
    extData: Record<string, any> = {},
    { userLocation }: { userLocation: LaasLocation },
): ClientConfig => {
    let apiPrefix = '';
    let csrfToken = core.req.csrfToken;

    if (api2Csrf && isUserForFF(core)) {
        apiPrefix = '/api2/v1';
        csrfToken = api2Csrf.generateToken({
            yandexuid: core.req.cookies && core.req.cookies.yandexuid,
            uid: '0',
        });
    }

    return {
        env: core.config.env,
        version: core.config.version,
        uid: getUID(core.req.blackbox),
        profileUrl: config.passportAuthUrl + '/profile',
        user: {
            email: getUserEmail(core.req.blackbox),
            firstName: getUserFirstName(core.req.blackbox),
            lastName: getUserLastName(core.req.blackbox),
            hasPhone: hasUserPhone(core.req.blackbox),
            location: userLocation,
        },
        reqid: core.getRequestId(),
        csrfToken,
        apiPrefix,
        userTemplate: getUserTemplate(core),
        metrikaId: core.config.metrika.counterId,
        metrikaSessionId: metrikaSessionId(core),
        metrikaCheckoutId: metrikaCheckoutId(core),
        services: config.clientServices,
        frameUrlWhitelist: getFramesSrc(config.yaCSP.presets),
        split: core.config.split,
        ...extData,
        features: {
            split: isSplitAvailable(core),
        },
    };
};
