const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const { resolvePackage, resolveService, resolveFiles } = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');
// eslint-disable-next-line import/order
const rum = require('@trust/rum/include/webpack')(
    { project: 'pay', page: 'sdk-init' },
    mode.isDevelopment,
);

const includePaths = [resolveService(''), resolvePackage('')];

module.exports = (serviceName) => {
    const service = getService(serviceName);

    const servicePath = resolveService('sdk-init');

    const srcPath = resolve(servicePath, 'src');
    const srcHtmlPath = resolve(servicePath, 'template');

    return {
        mode: mode.name,

        bail: true,
        devtool: mode.isDevelopment ? 'eval-source-map' : 'hidden-source-map',

        entry: {
            main: resolve(srcPath, 'index.ts'),
            ...rum.entry,
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
            rules: [].concat(
                requireWebpack('rules/typescript')(rum.paths, { sideEffects: true }),
                requireWebpack('rules/typescript')(includePaths),
            ),
        },

        plugins: [].concat(
            requireWebpack('plugins/clean')(),
            requireWebpack('plugins/define')(),
            requireWebpack('plugins/html')(resolveFiles(srcHtmlPath, 'html'), service.build.html, {
                customAssets: { ...rum.inlineAsset },
                order: ['rum-inline', '*', rum.entryName],
                body: [{ test: /.js/, inline: true }],
            }),
            requireWebpack('plugins/gzip')(),
        ),
    };
};
