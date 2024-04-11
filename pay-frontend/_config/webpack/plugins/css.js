// const assert = require('assert');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function pluginCss(options = {}) {
    // assert(options.filename, 'Required filename option');
    // assert(options.chunkFilename, 'Required chunkFilename option');

    return new MiniCssExtractPlugin({
        filename: options.filename,
        chunkFilename: options.chunkFilename,
        ignoreOrder: false,
    });
}

module.exports = pluginCss;
