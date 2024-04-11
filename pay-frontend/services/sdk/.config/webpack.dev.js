process.env.NODE_ENV = 'development';

const { getDevServerConfig } = require('@yandex-pay/config/dev-server/webpack');
const getEnv = require('@yandex-pay/config/env');

const serviceName = require('../package.json').name;

const webpackConfig = require('./webpack.base');

module.exports = (() => {
    return {
        ...webpackConfig(serviceName, {
            payHost: 'https://pay.local.yandex.ru:3010',
            metrikaId: '80508160',
            errorLoggerEnv: 'testing',
            buildVersion: getEnv('BUILD_VERSION', '0.0.0'),
        }),
        ...getDevServerConfig(serviceName),
    };
})();
