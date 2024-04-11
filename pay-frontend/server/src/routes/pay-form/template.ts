import userRenderer from '@yandex-lego/serp-header/dist/base/user2.desktop';

import config from '../../configs';
import { getFramesSrc } from '../../configs/csp/presets';
import { getThemeSettings } from '../../utils/get-theme-settings';
import { getUserEmail, getUserFullName, getAvatarId } from '../helpers/blackbox';
import { metrikaCheckoutId, metrikaSessionId } from '../helpers/metrika';
import WebCore from '../helpers/web-core';

type ClientConfig = Record<string, any>;

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

export const getClientConfig = (core: WebCore, extData: Record<string, any> = {}): ClientConfig => {
    return {
        env: core.config.env,
        version: core.config.version,
        uid: core.req.blackbox.uid,
        userEmail: getUserEmail(core.req.blackbox),
        userName: getUserFullName(core.req.blackbox),
        reqid: core.getRequestId(),
        csrfToken: core.req.csrfToken,
        userTemplate: getUserTemplate(core),
        metrikaId: core.config.metrika.counterId,
        metrikaSessionId: metrikaSessionId(core),
        metrikaCheckoutId: metrikaCheckoutId(core),
        services: config.clientServices,
        frameUrlWhitelist: getFramesSrc(config.yaCSP.presets),
        themeSettings: getThemeSettings(core),
        ...extData,
    };
};
