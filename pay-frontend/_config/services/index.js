/**
 * @fileoverview
 * Важно!
 * Тут прописаны public-path'ы (они же роуты)
 * которые используются при сборке, и роутинге на сервере.
 *
 * Если вы что-то тут меняете, проверьте:
 * - пути установки в server/Dockerfile
 * - пути роутинга в server/src/duffman
 * - пути роутинга в server/fs/etc/nginx
 * - пути роутинга в балансере
 *
 * Без крайней необходимости тут ничего не делать!
 */
const { resolveService, resolveServer } = require('../paths');

const { createServiceConfig } = require('./tools');

const DEV_SERVER_HOST = 'https://pay.local.yandex.ru:3010';
const BFF_SERVER_HOST = 'http://0.0.0.0:3099'; // Именно http
const WORKER_HOST = 'https://pay.local.yandex.ru:3100';

const DEFAULT_URL = '/web/playground/';

const SERVICES = [
    createServiceConfig({
        name: '@yandex-pay/demo-page',
        path: resolveService('demo-page'),
        publicPath: '/web/demo',
        skipS3Static: true,
    }),
    createServiceConfig({
        name: '@yandex-pay/playground',
        path: resolveService('playground'),
        publicPath: '/web/playground',
        skipS3Static: true,
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/demo-page-nda',
        path: resolveService('demo-page-nda'),
        publicPath: '/web/demo-nda',
        skipS3Static: true,
    }),
    createServiceConfig({
        name: '@yandex-pay/checkout-mock',
        path: resolveService('checkout-mock'),
        publicPath: '/web/checkout-mock',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/checkout',
        path: resolveService('checkout'),
        publicPath: '/web/checkout',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/pay-form',
        path: resolveService('pay-form'),
        publicPath: '/web/form',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/console',
        path: resolveService('console'),
        publicPath: '/web/console',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/console-registration',
        path: resolveService('console-registration'),
        publicPath: '/web/console-registration',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/sdk-payment-method',
        path: resolveService('sdk-payment-method'),
        publicPath: '/web/sdk/v1/payment-method',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/ready-check',
        path: resolveService('sdk-ready-check'),
        publicPath: '/web/sdk/v1/ready-check',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/sdk-init',
        path: resolveService('sdk-init'),
        publicPath: '/web/sdk/v1/init',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/sdk-init-speedup',
        path: resolveService('sdk-init-speedup'),
        publicPath: '/web/sdk/v1/init-speedup',
        buildHtmlPath: resolveServer('templates'),
    }),
    createServiceConfig({
        name: '@yandex-pay/sdk',
        path: resolveService('sdk'),
        publicPath: '/web/sdk/v1',
        // NB: SDK должна раздаваться только с нашего хоста!
        skipS3Static: true,
        rewrite: [['/sdk/v1/pay.js', () => '/web/sdk/v1/pay.js']],
    }),
    createServiceConfig({
        name: '@yandex-pay/mobile-api-assets',
        path: resolveService('mobile-api-assets'),
        publicPath: '/web/api/assets',
    }),
];

function getServiceNames() {
    return SERVICES.map((service) => service.name);
}

function getServiceIdx(serviceName) {
    const idx = SERVICES.findIndex((service) => service.name === serviceName);

    if (idx === -1) {
        throw new Error(`Unknown serviceName '${serviceName}'`);
    }

    return idx;
}

function getService(serviceName) {
    return SERVICES[getServiceIdx(serviceName)];
}

module.exports = {
    DEV_SERVER_HOST,
    BFF_SERVER_HOST,
    WORKER_HOST,
    DEFAULT_URL,
    getServiceNames,
    getService,
    getServiceIdx,
};
