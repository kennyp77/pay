const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const { resolvePackage, resolveService } = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');

const includePaths = [resolveService(''), resolvePackage('')];

const srcPath = resolve(__dirname, '../src');

module.exports = (serviceName) => {
    const service = getService(serviceName);

    return {
        mode: mode.name,

        bail: true, // лучше упасть, чем сгенерировать неполноценные иконки
        devtool: mode.isDevelopment ? 'eval' : 'hidden-source-map',

        entry: {
            main: [resolve(srcPath, 'index.ts')],
        },

        output: {
            path: service.build.root,
            filename: service.assets.js,
            publicPath: service.publicPath,
        },

        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            alias: {
                '@': srcPath,
            },
        },

        performance: {
            hints: 'warning',
        },

        module: {
            rules: [].concat(
                requireWebpack('rules/typescript')(includePaths),
                requireWebpack('rules/svg')(includePaths, {
                    filename: service.assets.freeze,
                }),
            ),
        },

        plugins: [].concat(
            require('./webpack-plugins/mobicon-v1')({
                manifestFilename: 'mobicon-manifest-v1.json',
                assetsUrl: service.publicPath,
            }),
            require('./webpack-plugins/mobicon-v2')({
                manifestFilename: 'mobicon-manifest-v2.json',
                assetsUrl: service.publicPath,
            }),
        ),
    };
};
