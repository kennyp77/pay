const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const { resolvePackage, resolveService, resolveFiles } = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');

const includePaths = [resolveService(''), resolvePackage('')];

module.exports = (serviceName) => {
    const service = getService(serviceName);

    const srcPath = resolve(__dirname, '../src');

    const srcHtmlPath = resolve(__dirname, '../template');

    return {
        mode: mode.name,

        bail: true,
        devtool: mode.isDevelopment ? false : 'hidden-source-map',

        entry: {
            main: resolve(srcPath, 'index.tsx'),
        },

        output: {
            path: service.build.root,
            filename: service.assets.js,
            publicPath: service.publicPath,
        },

        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },

        performance: {
            hints: 'warning',
        },

        optimization: Object.assign({}, requireWebpack('optimization/minimize')()),

        module: {
            rules: [].concat(requireWebpack('rules/typescript')(includePaths)),
        },

        plugins: [].concat(
            requireWebpack('plugins/clean')(),
            requireWebpack('plugins/define')(),
            requireWebpack('plugins/html')(resolveFiles(srcHtmlPath, 'html'), service.build.html),
        ),
    };
};
