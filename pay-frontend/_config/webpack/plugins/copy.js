const CopyPlugin = require('copy-webpack-plugin');

function pluginCopy(patterns) {
    return new CopyPlugin({ patterns });
}

module.exports = pluginCopy;
