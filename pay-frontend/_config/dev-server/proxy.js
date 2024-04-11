/**
 * @fileoverview
 * Тут эумулируется работа прод-сервера.
 * Работает на Webpack DevServer.
 */
const events = require('events');
const https = require('https');
const { URL } = require('url');

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { getServiceNames, getService, DEFAULT_URL, DEV_SERVER_HOST } = require('../services');

const { PROXY_ENTRIES, SSL_CERT_DATA } = require('./config');
const { getServiceUrl, getProxyPath } = require('./utils');

// Увеличил т.к. стреляло MaxListenersExceededWarning
events.defaultMaxListeners = 20;

const DEV_SERVER_PORT = parseInt(new URL(DEV_SERVER_HOST).port);

/**
 * Проксирует запросы до АПИ и до дочерних локальных dev-серверов
 */
function primaryProxy() {
    const proxy = [
        ['/web/api/mobile/v1/bank_logos', PROXY_ENTRIES.mobileAssetsJson],
        ['/web/api', PROXY_ENTRIES.duffman],
        ['/web/watch', PROXY_ENTRIES.watch],
        ['/web/clck', PROXY_ENTRIES.clck],
        ['/api/v1', PROXY_ENTRIES.payApi],
        ['/api/web/v1', PROXY_ENTRIES.consoleApi],
        ['/api/public/v1', PROXY_ENTRIES.payApi],
        ['/web/create_binding', PROXY_ENTRIES.trustApi],
    ];

    getServiceNames().forEach((serviceName) => {
        const service = getService(serviceName);
        const url = getServiceUrl(serviceName);
        const proxyPath = getProxyPath(service.publicPath);

        // TODO: ГРЯЗНЫЙ ХАК, исправить в https://st.yandex-team.ru/YANDEXPAY-2073
        url.hostname = '127.0.0.1';

        (service.rewrite || []).forEach(([triggerPath, rewriteRules]) => {
            proxy.push([
                triggerPath,
                {
                    secure: false,
                    target: url.origin,
                    pathRewrite: rewriteRules,
                },
            ]);
        });

        proxy.push([
            proxyPath,
            {
                secure: false,
                target: url.origin,
                // Для HOT
                ws: true,
            },
        ]);
    });

    // console.log(proxy);

    return proxy;
}

const app = express();
const server = https.createServer({ key: SSL_CERT_DATA, cert: SSL_CERT_DATA }, app);

primaryProxy().forEach(([proxyPath, proxyOptions]) => {
    app.use(proxyPath, createProxyMiddleware(proxyPath, proxyOptions));
});

app.get('/', (req, res) => {
    res.redirect(DEFAULT_URL);
});

server.listen(DEV_SERVER_PORT, () => {
    console.log(`\nProxy server: https://pay.local.yandex.ru:${DEV_SERVER_PORT}`);
});
