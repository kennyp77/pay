process.env.NODE_ENV = 'production';
const getEnv = require('@yandex-pay/config/env');

const serviceName = require('../package.json').name;

const webpackConfig = require('./webpack.base');

module.exports = (() => {
    return webpackConfig(serviceName, {
        payHost: 'https://pay.yandex.ru',
        metrikaId: '73147015',
        /**
         * Уникальная строка для замены в nginx на testing
         * (чтобы не задеть случайно другие данные)
         */
        errorLoggerEnv: 'production_vr8p6z9pn3',
        buildVersion: getEnv('BUILD_VERSION', '0.0.0'),
    });
})();
