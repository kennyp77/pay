const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const {
    resolvePath,
    resolvePackage,
    resolveService,
    resolveFiles,
} = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');

const includePaths = [
    resolveService(''),
    resolvePackage(''),
    resolvePath('node_modules/@yandex-serp-design'),
];

module.exports = (serviceName) => {
    const service = getService(serviceName);

    const srcPath = resolve(__dirname, '../src');
    const srcHtmlPath = resolve(__dirname, '../template');
    const tsconfigPath = resolve(__dirname, '../tsconfig.json');

    return {
        mode: mode.name,

        bail: true,
        devtool: mode.isDevelopment ? 'eval' : 'hidden-source-map',

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
                requireWebpack('rules/typescript')(includePaths, { configFile: tsconfigPath }),
                requireWebpack('rules/css')(includePaths),
                requireWebpack('rules/files')(includePaths, {
                    filename: service.assets.freeze,
                }),
                requireWebpack('rules/svg')(includePaths, {
                    filename: service.assets.freeze,
                }),
            ),
        },

        plugins: []
            .concat(
                mode.withHOT && requireWebpack('plugins/react-hot')(),
                requireWebpack('plugins/svg-sprite')(),
                requireWebpack('plugins/define')(),
                requireWebpack('plugins/css')({
                    filename: service.assets.css,
                }),
                requireWebpack('plugins/html')(
                    resolveFiles(srcHtmlPath, 'html'),
                    service.build.html,
                    {
                        order: ['main', '*', 'bundle'],
                        head: [{ test: /\.css$/, rumCounterId: 'local.static' }],
                        body: [{ test: /.*/, rumCounterId: 'local.static' }],
                    },
                ),
                requireWebpack('plugins/gzip')(),
            )
            .filter(Boolean),
    };
};
