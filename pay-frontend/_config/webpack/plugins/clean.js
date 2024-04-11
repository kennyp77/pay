const { CleanWebpackPlugin } = require('clean-webpack-plugin');

function pluginClean(patterns) {
    return new CleanWebpackPlugin(patterns);
}

module.exports = pluginClean;
