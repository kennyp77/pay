import { expressYandexCsp } from '@yandex-int/express-yandex-csp';

import type { CSPDirectives } from 'csp-header/src/types';

export const serverCspMiddleware = expressYandexCsp({
    directives: {
        'default-src': ["'none'"],
        'script-src': ['%nonce%'],
        'style-src': ["'unsafe-inline'"],
        'img-src': ['data:'],
        'font-src': ['https://yastatic.net'],
    },
    presets: [
        process.env.YENV === 'development' && {
            'script-src': ["'unsafe-eval'", "'unsafe-inline'"],
            'style-src': ["'unsafe-inline'"],
            'connect-src': ['ws:', 'wss:'],
        },
        {
            'default-src': ['self'],
            'script-src': ['self'],
            'style-src': ['self'],
            'font-src': ['self'],
            'img-src': ['self'],
            'connect-src': ['self'],
        },
        {
            'connect-src': ['https://yandex.ru'],
        },
        process.env.YENV !== 'production' && {
            'connect-src': ['https://api.stat.yandex-team.ru'],
        },
        {
            'script-src': ['https://mc.yandex.ru'],
            'img-src': ['https://mc.admetrica.ru', 'https://mc.yandex.ru'],
            'connect-src': ['https://mc.admetrica.ru', 'https://mc.yandex.ru'],
        },
        {
            'script-src': ['https://yastatic.net'],
            'font-src': ['https://yastatic.net'],
            'img-src': ['https://yastatic.net'],
        },
        {
            'img-src': ['https://avatars.mds.yandex.net', 'https://avatars.mdst.yandex.net'],
            'connect-src': ['https://api.passport.yandex.ru', 'https://api.passport-test.yandex.ru'],
            'object-src': ['https://avatars.mds.yandex.net'],
        },
        // @ts-ignore
    ].filter<CSPDirectives>(Boolean),
    useDefaultReportUri: true,
    project: 'yandex-pay-console',
    from: 'console.pay.yandex.ru',
});
