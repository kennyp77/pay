const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const {
    resolvePackage,
    resolveFiles,
    resolveService,
    resolveServer,
} = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');

const includePaths = [resolveService(''), resolvePackage(''), resolveServer('src')];

module.exports = (serviceName) => {
    const service = getService(serviceName);

    const srcPath = resolve(__dirname, '../src');
    const srcHtmlPath = resolve(__dirname, '../template');
    const tsconfigPath = resolve(__dirname, '../tsconfig.json');
    const srcFaviconPath = resolve(srcHtmlPath, 'favicon');

    return {
        mode: mode.name,

        bail: mode.isProduction,
        devtool: 'eval-source-map',

        entry: {
            main: resolve(srcPath, 'index.ts'),
        },

        output: {
            path: service.build.root,
            filename: service.assets.js,
            publicPath: service.publicPath,
        },

        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            modules: [resolve(srcPath), 'node_modules'],
        },

        performance: {
            hints: mode.isProduction ? 'warning' : false,
        },

        optimization: {
            ...requireWebpack('optimization/chunks')(),
            ...requireWebpack('optimization/minimize')(),
        },

        module: {
            rules: [].concat(
                requireWebpack('rules/typescript')(includePaths, { configFile: tsconfigPath }),
                requireWebpack('rules/scss')(includePaths, {
                    srcPath,
                    postcssPlugins: [require('tailwindcss')()],
                }),
                requireWebpack('rules/svg')(includePaths, {
                    sprite: {
                        filename: 'inline/inline-sprite.svg', // Для инлайна он совпадает с inlineSvgSprite
                    },
                }),
            ),
        },

        plugins: [].concat(
            mode.withHOT ? requireWebpack('plugins/react-hot')() : [],
            requireWebpack('plugins/svg-sprite')(),
            requireWebpack('plugins/define')(),
            requireWebpack('plugins/css')({
                filename: service.assets.css,
            }),
            requireWebpack('plugins/copy')([{ from: srcFaviconPath, to: service.build.favicon }]),
            requireWebpack('plugins/html')(resolveFiles(srcHtmlPath, 'html'), service.build.html, {
                inlineSvgSprite: 'inline-sprite.svg',
                head: [{ test: /\.css$/ }],
                body: [{ test: /\.js$/ }],
                favicon: {
                    ico: service.assets.favicon,
                    svg: service.assets.favicon,
                },
            }),
            mode.isProduction ? requireWebpack('plugins/gzip')() : [],
        ),
    };
};
