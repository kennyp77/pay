const assert = require('assert');
const { resolve } = require('path');

const mode = require('@yandex-pay/config/mode');
const { resolvePackage, resolveService } = require('@yandex-pay/config/paths');
const { getService } = require('@yandex-pay/config/services');
const { requireWebpack } = require('@yandex-pay/config/webpack/utils');

const includePaths = [resolveService(''), resolvePackage('')];

const srcPath = resolve(__dirname, '../src');

module.exports = (serviceName, options = {}) => {
    assert(options.payHost, 'Required payHost option');
    assert(options.metrikaId, 'Required metrikaId option');
    assert(options.errorLoggerEnv, 'Required errorLoggerEnv option');
    assert(options.buildVersion, 'Required buildVersion option');

    const service = getService(serviceName);

    const { payHost, metrikaId, errorLoggerEnv, buildVersion } = options;

    const srcFaviconPath = resolve(srcPath, '../favicon');

    return {
        mode: mode.name,

        bail: true,
        devtool: mode.isDevelopment ? 'eval-source-map' : 'hidden-source-map',

        entry: {
            main: resolve(srcPath, 'index.ts'),
        },

        output: {
            path: service.build.root,
            filename: 'pay.js',
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
                requireWebpack('rules/typescript')(includePaths),
                requireWebpack('rules/css')(includePaths, {
                    filename: service.assets.css,
                }),
                requireWebpack('rules/svg')(includePaths, {
                    filename: service.assets.freeze,
                }),
            ),
        },

        plugins: [].concat(
            requireWebpack('plugins/clean')(),
            requireWebpack('plugins/define')({
                __PAY_HOST__: payHost,
                __METRIKA_ID__: metrikaId,
                __ERROR_LOGGER_ENV__: errorLoggerEnv,
                __BUILD_VERSION__: buildVersion,
            }),
            requireWebpack('plugins/copy')([
                { from: srcFaviconPath, to: service.build.favicon },
                // Костыли для зафриженных SDK
                // Пережимать их смысла нет, это решение временное
                // https://st.yandex-team.ru/YANDEXPAY-3809
                // https://st.yandex-team.ru/YANDEXPAY-3998
                {
                    from: 'src/assets/yapay-pay-white-red.svg',
                    to: 'media/yapay-pay-white-red.6ee444f1.svg',
                },
                {
                    from: 'src/assets/yapay-pay-white-red.svg',
                    to: 'media/yapay-pay-white-red.be7bbbbd.svg',
                },
                {
                    from: 'src/assets/yapay-pay-black-red.svg',
                    to: 'media/yapay-pay-black-red.19e943b1.svg',
                },
                {
                    from: 'src/assets/yapay-pay-black-red.svg',
                    to: 'media/yapay-pay-black-red.7a35a956.svg',
                },
                {
                    from: 'src/assets/yapay-simple-white-red.svg',
                    to: 'media/yapay-simple-white-red.00700406.svg',
                },
                {
                    from: 'src/assets/yapay-simple-white-red.svg',
                    to: 'media/yapay-simple-white-red.553500d2.svg',
                },
                {
                    from: 'src/assets/yapay-simple-black-red.svg',
                    to: 'media/yapay-simple-black-red.cd635ec9.svg',
                },
                {
                    from: 'src/assets/yapay-simple-black-red.svg',
                    to: 'media/yapay-simple-black-red.903486c5.svg',
                },
                {
                    from: 'src/assets/robokassa-icon.svg',
                    to: 'media/robokassa-icon.f6c2cebd.svg',
                },
                {
                    from: 'src/assets/yapay-pay-white-red.svg',
                    to: '_/yapay-pay-white-red.bafad6ae.svg',
                },
                {
                    from: 'src/assets/yapay-pay-black-red.svg',
                    to: '_/yapay-pay-black-red.0ae8883e.svg',
                },
                {
                    from: 'src/assets/yapay-simple-white-red.svg',
                    to: '_/yapay-simple-white-red.4c8b26df.svg',
                },
                {
                    from: 'src/assets/yapay-simple-black-red.svg',
                    to: '_/yapay-simple-black-red.c3bf7b87.svg',
                },
                {
                    from: 'src/assets/yapay-simple-black-red.svg',
                    to: '_/yapay-simple-black-red.32caa6f8.svg',
                },
            ]),
            requireWebpack('plugins/gzip')(),
        ),
    };
};
