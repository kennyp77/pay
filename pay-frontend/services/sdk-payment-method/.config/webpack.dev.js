global.WEBPACK_HOT = true;
process.env.NODE_ENV = 'development';
process.env.YENV = 'development';

const { getDevServerConfig } = require('@yandex-pay/config/dev-server/webpack');

const serviceName = require('../package.json').name;

const webpackConfig = require('./webpack.base');

module.exports = (() => {
    return {
        ...webpackConfig(serviceName),
        ...getDevServerConfig(serviceName, { writeHtmlToDisk: true }),
    };
})();
