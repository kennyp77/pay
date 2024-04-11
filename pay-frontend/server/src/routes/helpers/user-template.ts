import userRenderer from '@yandex-lego/serp-header/dist/base/user2.desktop';

import config from '../../configs';
import { getAvatarId } from '../helpers/blackbox';
import WebCore from '../helpers/web-core';

// TODO: запихнуть в форму и чекаут
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
