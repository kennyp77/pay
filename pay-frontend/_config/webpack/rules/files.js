// const assert = require('assert');

function ruleFiles(include, options = {}) {
    // assert(options.filename, 'Required filename option');

    return [
        {
            test: /\.(gif|png|jpe?g|ogg|mp3|eot|ttf|woff|woff2)$/,
            include,
            type: 'asset/resource',
            generator: {
                filename: options.filename,
                publicPath: options.publicPath,
                outputPath: options.outputPath,
            },
        },
    ];
}

module.exports = ruleFiles;
