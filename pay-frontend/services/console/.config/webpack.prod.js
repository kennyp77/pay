process.env.NODE_ENV = 'production';

const serviceName = require('../package.json').name;

const webpackConfig = require('./webpack.base');

module.exports = (() => {
    return webpackConfig(serviceName);
})();
