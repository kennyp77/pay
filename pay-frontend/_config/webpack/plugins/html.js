const path = require('path');

const mode = require('@yandex-pay/config/mode');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlAssetsWebpackPlugin = require('../_plugins/html-assets-webpack-plugin');

function pluginHtml(htmlTemplates, destPath, assetsOptions) {
    let minify = {
        keepClosingSlash: true,
    };

    if (mode.isProduction) {
        minify = {
            ...minify,
            removeComments: true,
            collapseWhitespace: false,
            preserveLineBreaks: true,
        };
    }

    return [
        ...htmlTemplates.map((template) => {
            const filename = path.resolve(destPath, path.parse(template).base);

            return new HtmlWebpackPlugin({
                template,
                minify,
                filename,
                inject: true,
                xhtml: true,
            });
        }),
        assetsOptions && new HtmlAssetsWebpackPlugin(assetsOptions),
    ].filter(Boolean);
}

module.exports = pluginHtml;
