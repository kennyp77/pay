// eslint-disable-next-line import/order
const genEnv = require('@yandex-pay/config/env');

process.env.NODE_ENV = 'development';
process.env.WEBPACK_HOT = genEnv('HOT', 'true');

// eslint-disable-next-line import/order
const { getDevServerConfig } = require('@yandex-pay/config/dev-server/webpack');

const serviceName = require('../package.json').name;

const webpackConfig = require('./webpack.base');

module.exports = (() => {
    return {
        ...webpackConfig(serviceName),
        performance: {
            hints: false,
        },
        ...getDevServerConfig(serviceName),
    };
})();
