import { express } from '@yandex-int/duffman';

import { ExpressHandler } from '../typings/common';

// RegExp for extracting the second and the top level domains
const DOMAIN_RE =
    /[a-z-]+\.(az|by|co\.il|com|com\.am|com\.ge|com\.tr|ee|fr|kg|kz|lt|lv|md|ru|tj|tm|ua|uz|rs|cn|eu)$/;

// @see https://wiki.yandex-team.ru/Cookies/yandexuid#kudastavitsja
const YANDEX_DOMAINS = [
    'ya.ru',
    'yandex.az',
    'yandex.by',
    'yandex.co.il',
    'yandex.com',
    'yandex.com.am',
    'yandex.com.ge',
    'yandex.com.tr',
    'yandex.ee',
    'yandex.fr',
    'yandex.kg',
    'yandex.kz',
    'yandex.lt',
    'yandex.lv',
    'yandex.md',
    'yandex.ru',
    'yandex.tj',
    'yandex.tm',
    'yandex.ua',
    'yandex.uz',
    'yandex.rs',
    'yandex-ad.cn',
    'yandex-team.ru',
    'yandex.eu',
];

function domain(req: express.Req): string {
    const hostname = req.hostname || req.host;
    const matches = DOMAIN_RE.exec(hostname);

    return matches ? matches[0] : null;
}

function isYandexDomain(_domain: string): boolean {
    return YANDEX_DOMAINS.indexOf(_domain) !== -1;
}

function generateYmUid(): string {
    const now = (Date.now() * 0.001) | 0;
    const rnd = (Math.random() * 1073741824) | 0;

    return `${now}${rnd}`;
}

export interface YmUidOptions {
    fromQuery?: string;
    setOnPost?: boolean;
}

export default function (options: YmUidOptions = {}): ExpressHandler {
    return function expressYmUid(req, res, next) {
        const queryYmUid = (options.fromQuery ? req.query[options.fromQuery] : '') || '';

        if (!req.cookies) {
            return next(
                new Error(
                    'cookie-parser middleware is not installed. Add it before use express-yandexuid: app.use(require("cookie-parser")())',
                ),
            );
        }

        if (!req.uatraits) {
            return next(
                new Error(
                    'express-uatraits middleware is not installed. Add it before use express-yandexuid: app.use(require("express-uatraits")())',
                ),
            );
        }

        // NB: Пропускаем задание куки, только если она не переопределяется в УРЛ
        if (
            (!queryYmUid && req.cookies._ym_uid) ||
            (queryYmUid && req.cookies._ym_uid === queryYmUid)
        ) {
            return next();
        }

        // Do not set _ym_uid if the agent is not browser at all (bot, curl, wget)
        // or if the agent is a robot or doesn't supports cookies
        // @see https://wiki.yandex-team.ru/passport/mda#anameapiapidljaservisov
        if (
            !req.uatraits.isBrowser ||
            req.uatraits.isRobot ||
            !(req.method === 'GET' || (req.method === 'POST' && options.setOnPost)) ||
            req.query.nocookiesupport === 'yes'
        ) {
            return next();
        }

        const yaDomain = domain(req);

        if (yaDomain && isYandexDomain(yaDomain)) {
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);

            const opts = {
                domain: `.${yaDomain}`,
                path: '/',
                expires,
                secure: true,
                sameSite: 'none',
            };

            req.cookies._ym_uid = queryYmUid || generateYmUid();

            res.cookie('_ym_uid', req.cookies._ym_uid, opts);
        }

        return next();
    };
}
