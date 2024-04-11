const CompressionPlugin = require('compression-webpack-plugin');

function pluginGzip(options = {}) {
    return new CompressionPlugin({
        ...options,
        compressionOptions: { level: 4 },
        exclude: /.+\.html$/, // собираем html на лету в nginx
    });
}

module.exports = pluginGzip;
