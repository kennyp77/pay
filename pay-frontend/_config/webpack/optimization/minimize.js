const mode = require('@yandex-pay/config/mode');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

function optimizationMinimize() {
    return {
        minimize: mode.isProduction,
        minimizer: [
            new TerserPlugin({
                extractComments: true,
                parallel: true,
            }),
            new CssMinimizerPlugin(),
        ],
    };
}

module.exports = optimizationMinimize;
