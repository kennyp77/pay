/**
 * @fileoverview
 * Форк express-yandexuid
 * Отличие от оригинала — простановка куки на POST запросы по опции
 * TODO: Добавить опцию в оригинальную либу
 */

import { express } from '@yandex-int/duffman';

import { ExpressHandler } from '../typings/common';

// RegExp for checking the validity of an yandexuid string. 17-20 digits
const YANDEX_UID_RE = /^\d{17,20}$/;

// RegExp for extracting the second and the top level domains
const DOMAIN_RE =
    /[a-z\-]+\.(az|by|co\.il|com|com\.am|com\.ge|com\.tr|ee|fr|kg|kz|lt|lv|md|ru|tj|tm|ua|uz|rs|cn|eu)$/;

// List of yandex domains
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

/**
 * Returns the hostname of the client's request. The method can handle both express 3.x and 4.x Request instances.
 */
function hostname(req: express.Req): string {
    return req.hostname || req.host;
}

/**
 * Extracts the second and top level domains of the host.
 */
function domain(hostname: string): string | null {
    const matches = DOMAIN_RE.exec(hostname);

    return matches ? matches[0] : null;
}

/**
 * Checks the validity of the cookie.
 */
function valid(yandexuid: string): boolean {
    // The cookie should match the cookie RegExp (contain 17-20 digits) and
    // contain a timestamp (in seconds) from the past in the last 10 chars.
    // Cookie must not start with zero
    // @see https://wiki.yandex-team.ru/Cookies/yandexuid#format
    return (
        YANDEX_UID_RE.test(yandexuid) &&
        yandexuid[0] !== '0' &&
        parseInt(yandexuid.slice(-10), 10) < Date.now() / 1000
    );
}

/**
 * Checks if the provided domain is one of Yandex domains
 */
function isYandexDomain(domain: string): boolean {
    return YANDEX_DOMAINS.indexOf(domain) !== -1;
}

/**
 * Returns a configurable middleware for checking the validity and creating yandexuid cookies.
 */
interface YandexuidOptions {
    yaDomain?: string;
    expires?: Date;
    setOnPost?: boolean;
}

export default function (options: YandexuidOptions = {}): ExpressHandler {
    return function expressYandexUid(req, res, next) {
        if (!req.cookies) {
            return next(
                new Error(
                    'cookie-parser middleware is not installed. Add it before use express-yandexuid: app.use(require("cookie-parser")())',
                ),
            );
        }

        if (valid(req.cookies.yandexuid)) {
            return next();
        }

        if (!req.uatraits) {
            return next(
                new Error(
                    'express-uatraits middleware is not installed. Add it before use express-yandexuid: app.use(require("express-uatraits")())',
                ),
            );
        }

        // Do not set yandexuid if the agent is not browser at all (bot, curl, wget)
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

        const fullHostName = hostname(req);
        const yaDomain = options.yaDomain || domain(fullHostName);

        // For non-localhost yandex domains generate yandexuid cookie
        if (yaDomain && isYandexDomain(yaDomain)) {
            req.cookies.yandexuid =
                (Math.random() * 1e9).toFixed() + String(Date.now()).substr(0, 10);

            // set the cookie expiration date to "never". in the cookie world "never" is 10 years in the future
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 10);

            const opts: Record<string, any> = {
                domain: '.' + yaDomain,
                path: '/',
                expires: options.expires || expires,
            };

            let hasSameSiteSupport = req.uatraits.SameSiteSupport;
            if (!hasSameSiteSupport) {
                if (req.uatraits.BrowserBase === 'Chromium' && req.uatraits.BrowserBaseVersion) {
                    const browserBaseVersionRound = parseInt(
                        req.uatraits.BrowserBaseVersion.split('.')[0],
                    );
                    if (browserBaseVersionRound >= 76) {
                        hasSameSiteSupport = true;
                    }
                }
            }

            if (hasSameSiteSupport) {
                opts.secure = true;
                opts.sameSite = 'none';
            }
            res.cookie('yandexuid', req.cookies.yandexuid, opts);
        }

        next();
    };
}
