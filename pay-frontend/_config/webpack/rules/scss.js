const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { SUPPORTED_BROWSERS } = require('../browsers');

function ruleScss(include, options = {}) {
    const { supportedBrowsers = SUPPORTED_BROWSERS } = options;

    return {
        test: /\.scss$/,
        include,
        use: [
            MiniCssExtractPlugin.loader,
            require.resolve('css-loader'),
            {
                loader: require.resolve('postcss-loader'),
                options: {
                    sourceMap: true,
                    postcssOptions: {
                        parser: require.resolve('postcss-scss'),
                        plugins: [
                            require('postcss-import')({ path: options.srcPath }),
                            require('postcss-nested')(),
                            require('postcss-css-variables')(),
                            require('postcss-flexbugs-fixes')(),
                            require('autoprefixer')(supportedBrowsers),
                            ...options.postcssPlugins,
                        ],
                    },
                },
            },
        ],
        sideEffects: true,
    };
}

module.exports = ruleScss;
