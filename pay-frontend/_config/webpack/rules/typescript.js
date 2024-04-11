const { SUPPORTED_BROWSERS } = require('../browsers');
const buildBabel = require('../build-babel');

function ruleTypescript(include, options = {}) {
    const { supportedBrowsers = SUPPORTED_BROWSERS } = options;

    const babelCodeLoader = {
        loader: require.resolve('babel-loader'),
        options: buildBabel(false, supportedBrowsers),
    };

    const babelReactCodeLoader = {
        loader: require.resolve('babel-loader'),
        options: buildBabel(true, supportedBrowsers),
    };

    return {
        test: /\.(jsx?|tsx?)$/,
        include,
        oneOf: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                use: [require.resolve('thread-loader'), babelCodeLoader],
            },
            {
                test: /\.(jsx|tsx)$/,
                exclude: /node_modules/,
                use: [require.resolve('thread-loader'), babelReactCodeLoader],
            },
        ],
        sideEffects: Boolean(options.sideEffects),
    };
}

module.exports = ruleTypescript;
