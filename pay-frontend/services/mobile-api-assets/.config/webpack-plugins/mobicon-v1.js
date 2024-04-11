const assert = require('assert');

const WebpackAssetsManifest = require('webpack-assets-manifest');

const { getIconName, getIconPath } = require('./utils');

function pluginMobiconV1(options = {}) {
    assert(options.manifestFilename, 'Required manifestFile option');

    return new WebpackAssetsManifest({
        output: options.manifestFilename,
        customize: (entry) => {
            if (/\.svg$/.test(entry.key)) {
                const { name, theme, variant } = getIconName(entry.key);

                if (theme || variant) {
                    return false;
                }

                return {
                    key: name,
                    value: getIconPath(entry.value, options.assetsUrl),
                };
            }

            return false;
        },
    });
}

module.exports = pluginMobiconV1;
