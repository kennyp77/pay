const cssnano = require('cssnano');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = require('../../mode');
const { SUPPORTED_BROWSERS } = require('../browsers');

const postcssLoader = (plugins = []) => ({
    loader: 'postcss-loader',
    options: {
        sourceMap: mode.isDevelopment,
        postcssOptions: { plugins },
    },
});

const cssLoader = {
    loader: 'css-loader',
    options: {
        importLoaders: 2,
        sourceMap: mode.isDevelopment,
    },
};

const miniCssLoader = {
    loader: MiniCssExtractPlugin.loader,
};

const sassLoader = {
    loader: 'sass-loader',
    options: {
        sourceMap: mode.isDevelopment,
    },
};

function ruleCss(include, options = {}) {
    const { supportedBrowsers = SUPPORTED_BROWSERS } = options;

    return [
        {
            test: /\.css$/,
            use: [
                miniCssLoader,
                cssLoader,
                postcssLoader(
                    [
                        require('postcss-import')(),
                        require('postcss-simple-vars'),
                        require('../_plugins/postcss-apply'),
                        require('postcss-nested')(),
                        require('postcss-preset-env')({
                            preserve: false,
                            browser: supportedBrowsers,
                            features: {
                                'custom-media-queries': true,
                                'custom-properties': true,
                            },
                        }),
                        require('autoprefixer')({ overrideBrowserslist: supportedBrowsers }),
                        mode.isProduction && cssnano,
                        require('postcss-custom-selectors')(),
                        require('postcss-custom-media')(),
                    ].filter(Boolean),
                ),
            ],
            sideEffects: true,
        },
        {
            test: /\.scss$/,
            include,
            use: [
                miniCssLoader,
                cssLoader,
                postcssLoader(
                    [
                        require('autoprefixer')({ overrideBrowserslist: supportedBrowsers }),
                        mode.isProduction && cssnano,
                    ].filter(Boolean),
                ),
                sassLoader,
            ],
            sideEffects: true,
        },
    ];
}

module.exports = ruleCss;
