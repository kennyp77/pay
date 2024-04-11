const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const { resolvePackage, resolveService, resolveFiles } = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');

const includePaths = [resolveService(''), resolvePackage('')];

module.exports = (serviceName) => {
    const service = getService(serviceName);

    const servicePath = resolveService('sdk-init-speedup');

    const srcPath = resolve(servicePath, 'src');
    const srcHtmlPath = resolve(servicePath, 'template');

    return {
        mode: mode.name,

        bail: true,
        devtool: mode.isDevelopment ? 'eval-source-map' : 'hidden-source-map',

        entry: {
            main: resolve(srcPath, 'index.ts'),
        },

        output: {
            path: service.build.root,
            filename: '[name].js',
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
            requireWebpack('plugins/html')(resolveFiles(srcHtmlPath, 'html'), service.build.html, {
                body: [{ test: /.js/, inline: true }],
            }),
            requireWebpack('plugins/gzip')(),
        ),
    };
};
