const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const { resolvePackage, resolveService, resolveFiles } = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');
// eslint-disable-next-line import/order
const rum = require('@trust/rum/include/webpack')(
    { project: 'pay', page: 'sdk-payment-method' },
    mode.isDevelopment,
);

const includePaths = [resolveService(''), resolvePackage('')];

module.exports = (serviceName) => {
    const service = getService(serviceName);

    const srcPath = resolve(__dirname, '../src');
    const srcHtmlPath = resolve(__dirname, '../template');

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
            filename: service.assets.js,
            publicPath: service.publicPath,
            assetModuleFilename: service.assets.freeze,
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

        optimization: {
            ...requireWebpack('optimization/chunks')(),
            ...requireWebpack('optimization/minimize')(),
        },

        module: {
            rules: [].concat(
                requireWebpack('rules/typescript')(rum.paths, { sideEffects: true }),
                requireWebpack('rules/typescript')(includePaths),
                requireWebpack('rules/css')(includePaths),
                requireWebpack('rules/files')(includePaths, {
                    filename: service.assets.freeze,
                }),
                requireWebpack('rules/svg')(includePaths, {
                    sprite: {
                        filename: 'inline/inline-sprite.svg', // Для инлайна он совпадает с inlineSvgSprite
                    },
                }),
            ),
        },

        plugins: [].concat(
            requireWebpack('plugins/svg-sprite')(),
            requireWebpack('plugins/define')(),
            requireWebpack('plugins/css')({
                filename: service.assets.css,
            }),
            requireWebpack('plugins/html')(resolveFiles(srcHtmlPath, 'html'), service.build.html, {
                inlineSvgSprite: 'inline-sprite.svg',
                customAssets: { ...rum.inlineAsset },
                order: ['rum-inline', 'main', '*', 'bundle', rum.entryName],
                head: [
                    { test: 'rum-inline', inline: true },
                    { test: /\.css$/, rumCounterId: 'local.static' },
                ],
                body: [{ test: /.*/, rumCounterId: 'local.static' }],
            }),
        ),
    };
};
