import { YaEnv } from '../typings/common';
import { paths, getSystemUsername } from '../utils';

import { policiesDev } from './csp/policies';
import * as csp from './csp/presets';
import ProductionConfig from './production';

export default class DevelopmentConfig extends ProductionConfig {
    env: YaEnv = 'development';

    version = 'local-dev';

    systemTemplatesPath = paths.resolve('../templates');

    services = {
        addrs: { url: 'http://addrs-testing.search.yandex.net/search/stable/yandsearch' },
        'pay-webapi': { url: 'https://test.pay.yandex.ru' },
        'console-webapi': { url: 'https://test.console.pay.yandex.ru' },
        passport: { url: 'https://api.passport-test.yandex.ru' },
        avatars: { url: 'https://avatars.mdst.yandex.net' },
        blackbox: { host: 'blackbox-test.yandex.net' },
        'blackbox-api': { url: 'http://blackbox-test.yandex.net' },
        uaas: { url: 'http://uaas.search.yandex.net' },
        laas: { url: 'http://laas.yandex.ru' },
        bunker: {
            url: 'http://bunker-api-dot.yandex.net/v1',
            project: 'yandexpay-front/config',
            version: 'latest',
        },
    };

    avatarUrl = 'https://avatars.mdst.yandex.net';

    passportAuthUrl = 'https://passport-test.yandex.ru';
    passportAuthOrigin = 'pay';

    metrika = {
        host: 'https://mc.yandex.ru',
        counterId: '80508160',
        pageUrl: 'https://test.pay.yandex.ru',
        consoleCounterId: '86950181',
    };

    clientServices = {
        // к трасту ходим через локальную проксю
        trust: 'https://pay.local.yandex.ru:3010',
        // в console pay ходим через локальную проксю
        console: 'https://pay.local.yandex.ru:3010',
        // NB: Токен Маркета мы используем для тестирования 3DS
        trustServiceToken: 'blue_market_payments_5fac16d65c83b948a5b10577f373ea7c',
        geo: 'https://suggest-maps-test.n.yandex-team.ru',
        mapApiKey: 'afe8f728-7a72-4b37-b4f3-7da6d1e1e311',
    };

    uatraits = {
        browser: paths.resolve('../local/uatraits/browser.xml'),
        profiles: paths.resolve('../local/uatraits/profiles.xml'),
        extra: paths.resolve('../local/uatraits/extra.xml'),
    };

    abt = {
        service: 'trust',
        handler: 'TRUST',
        serviceId: 10002,
        headers: {
            'X-Forwarded-For-Y': '141.8.148.183', // Нужно для работы локально
        },
    };

    laas = {
        service: 'yandex-pay',
    };

    disabledMerchantId = ['c1069d7a-0e0d-4251-9ba0-aa763a13b4f9'];

    withoutPersonalizeMerchantId = ['6efc52fd-f380-4faf-b5df-c6c61e762d0c'];

    shortCashbackViewMerchantId = ['6efc52fd-f380-4faf-b5df-c6c61e762d0c'];

    split = {
        merchantId: [
            '7b1694c8-fc12-45dd-9b76-7b846c29d195', // Local BrandShop
        ],
        amountRange: [1000, 100000],
    };

    monochromeLogoMerchantId: string[] = [
        // '7b1694c8-fc12-45dd-9b76-7b846c29d195', // Local BrandShop
    ];

    playground = {
        devUsername: getSystemUsername(),
    };

    yaCSP = {
        presets: [
            csp.self,
            csp.selfDev,
            csp.trust,
            csp.trustTest,
            csp.trustDev,
            csp.bnpl.dev,
            csp.auth3ds.dev,
            csp.geo,
            csp.geoTest,
            csp.rum,
            csp.rumDev,
            csp.metrika,
            csp.yastatic,
            csp.passport,
            csp.cspUrl,
            csp.yamaps,
            csp.consoleApiTest,
        ],
        policies: policiesDev,
        reportUri: '/csp',
        project: 'pay',
        serviceName: 'pay',
    };

    monochromeBackgroundMerchantIds = [
        'b158a78a-ca73-4dda-867c-b826d86c4a74', // testing-tinkoff
    ];
}
