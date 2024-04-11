import { YaEnv } from '../typings/common';
import { paths, getEnv } from '../utils';

import { policies } from './csp/policies';
import * as csp from './csp/presets';

export type yaCSP = {
    presets: Record<string, string[]>[];
    policies: Record<string, string[]>;
    reportUri: string;
    project: string;
    serviceName: string;
};

export default class ProductionConfig {
    env: YaEnv = 'production';

    version = getEnv('BUILD_VERSION', '0.0.0');

    systemTemplatesPath = paths.resolve('../templates');

    services = {
        addrs: { url: 'http://addrs.yandex.ru:17140/yandsearch' },
        'pay-webapi': { url: 'https://pay.yandex.ru' },
        'console-webapi': { url: 'https://console.pay.yandex.ru' },
        passport: { url: 'https://api.passport.yandex.ru' },
        avatars: { url: 'https://avatars.mdst.yandex.net' },
        blackbox: { host: 'blackbox.yandex.net' },
        'blackbox-api': { url: 'http://blackbox.yandex.net' },
        uaas: { url: 'http://uaas.search.yandex.net' },
        laas: { url: 'http://laas.yandex.ru' },
        bunker: {
            url: 'http://bunker-api.yandex.net/v1',
            project: 'yandexpay-front/config',
            version: 'stable',
        },
    };

    avatarUrl = 'https://avatars.mds.yandex.net';

    passportAuthUrl = 'https://passport.yandex.ru';
    passportAuthOrigin = 'pay';

    metrika = {
        host: 'https://mc.yandex.ru',
        counterId: '73147015',
        pageUrl: 'https://pay.yandex.ru',
        consoleCounterId: '86950181',
    };

    clientServices = {
        trust: 'https://trust.yandex.ru',
        console: 'https://console.pay.yandex.ru',
        trustServiceToken: 'yandex_pay_plus_backend_f8c528b768e7421ee0e3258995201aaa',
        geo: 'https://suggest-maps.yandex.ru',
        mapApiKey: 'afe8f728-7a72-4b37-b4f3-7da6d1e1e311',
    };

    uatraits = {
        browser: '/usr/share/uatraits/browser.xml',
        profiles: '/usr/share/uatraits/profiles.xml',
        extra: '/usr/share/uatraits/extra.xml',
    };

    abt = {
        service: 'trust',
        handler: 'TRUST',
        serviceId: 10001,
    };

    disabledMerchantId: string[] = ['96712af9-5cf4-4cf8-be12-28f3dcd6051a'];

    withoutPersonalizeMerchantId: string[] = ['72360794-5752-4570-aad8-543ed3d22834'];

    shortCashbackViewMerchantId: string[] = ['72360794-5752-4570-aad8-543ed3d22834'];

    split = {
        merchantId: [
            '1a5f80a0-93e4-43ee-8996-b7aea5053c88', // Production BrandShop
        ],
        amountRange: [1000, 100000],
    };

    monochromeLogoMerchantId: string[] = [
        // '1a5f80a0-93e4-43ee-8996-b7aea5053c88', // Production BrandShop
    ];

    laas = {
        service: 'yandex-pay',
    };

    playground = {
        devUsername: '',
    };

    yaCSP: yaCSP = {
        presets: [
            csp.self,
            csp.trust,
            csp.bnpl.prod,
            csp.auth3ds.prod,
            csp.geo,
            csp.rum,
            csp.metrika,
            csp.yastatic,
            csp.passport,
            csp.cspUrl,
            csp.yamaps,
            csp.consoleApi,
        ],
        policies,
        reportUri: 'https://csp.yandex.net/csp',
        project: 'pay',
        serviceName: 'pay',
    };

    monochromeBackgroundMerchantIds = [
        'ad1bd100-ab49-4752-98da-4ae3a41ec969', // tinkoff
    ];
}
