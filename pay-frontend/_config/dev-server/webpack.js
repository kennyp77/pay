const events = require('events');

const { getService } = require('../services');

const { PROXY_ENTRIES, SSL_CERT_PATH } = require('./config');
const { getServiceUrl, hasDuffmanDest, getProxyPath, setProxyPath } = require('./utils');

// Увеличил т.к. стреляло MaxListenersExceededWarning
events.defaultMaxListeners = 20;

const HTML_PATH_RX = /(\.html)$/;
const ASSETS_PATH_RX = /\.(css|js|png|gif|jpe?g|svg|woff2|woff|json)$/;

const isHtmlFile = (path) => HTML_PATH_RX.test(path);
const isHtmlUrl = (path) => !ASSETS_PATH_RX.test(path);

function getDevServerConfig(serviceName, options = {}) {
    const service = getService(serviceName);
    const url = getServiceUrl(serviceName);

    let proxyConfig = {};
    const devMiddleware = {};

    // NB: Duffman берет шаблоны с диска
    //     Первый раз мы должны по честному записать на диск
    if (hasDuffmanDest(serviceName)) {
        let firstWrite = false;

        devMiddleware.writeToDisk = (path) => {
            if (isHtmlFile(path) && !firstWrite) {
                firstWrite = true;

                return true;
            }

            return false;
        };
    }

    if (options.writeHtmlToDisk) {
        devMiddleware.writeToDisk = isHtmlFile;
    }

    if (hasDuffmanDest(serviceName)) {
        proxyConfig = {
            context: (pathname) => isHtmlUrl(pathname),
            ...PROXY_ENTRIES.duffman,
        };
    }

    return {
        devServer: {
            historyApiFallback: false,

            hot: process.env.WEBPACK_HOT === 'true' ? 'only' : false,
            liveReload: false,

            http2: true,
            https: {
                cert: SSL_CERT_PATH,
                key: SSL_CERT_PATH,
            },

            host: url.hostname,
            port: url.port,

            devMiddleware,

            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },

            static: {
                directory: service.build.root,
                publicPath: [service.publicPath],
            },

            proxy: proxyConfig,

            allowedHosts: 'all',
        },
    };
}

module.exports = {
    getDevServerConfig,
};
