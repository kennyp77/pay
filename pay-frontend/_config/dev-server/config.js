/**
 * @fileoverview
 * Тут эумулируется работа прод-сервера.
 * Работает на Webpack DevServer.
 */
const fs = require('fs');

const { homePath } = require('../paths');
const { getService, BFF_SERVER_HOST } = require('../services');

const { getServiceUrl } = require('./utils');

const SSL_CERT_PATH = homePath('.dev-cert/local-cert.pem');
const SSL_CERT_DATA = fs.readFileSync(SSL_CERT_PATH);

const PROXY_ENTRIES = {
    duffman: {
        secure: false,
        target: BFF_SERVER_HOST,
    },
    watch: {
        secure: false,
        target: 'https://mc.yandex.ru',
        pathRewrite: { '^/web': '' },
    },
    clck: {
        secure: false,
        target: 'https://yandex.ru',
        pathRewrite: { '^/web': '' },
    },
    payApi: {
        secure: false,
        target: 'https://test.pay.yandex.ru',
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('Host', 'test.pay.yandex.ru');
        },
    },
    consoleApi: {
        secure: false,
        target: 'https://test.console.pay.yandex.ru',
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('Host', 'test.console.pay.yandex.ru');
        },
    },
    trustApi: {
        secure: false,
        target: 'https://trust-test.yandex.ru',
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('Host', 'trust-test.yandex.ru');
            proxyReq.setHeader('Origin', 'test.pay.yandex.ru');
        },
    },
    mobileAssetsJson: {
        secure: false,
        target: getServiceUrl('@yandex-pay/mobile-api-assets'),
        pathRewrite: () =>
            [getService('@yandex-pay/mobile-api-assets').publicPath, 'mobicon-manifest.json'].join(
                '',
            ),
    },
};

module.exports = {
    SSL_CERT_PATH,
    SSL_CERT_DATA,
    PROXY_ENTRIES,
};
