const assert = require('assert');

const mergeDeep = require('@tinkoff/utils/object/mergeDeep');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const { getIconName, getIconPath } = require('./utils');

const ICONS_MAP = {};

function pluginMobicon(options = {}) {
    assert(options.manifestFilename, 'Required manifestFile option');

    return new WebpackAssetsManifest({
        output: options.manifestFilename,
        customize: (entry) => {
            if (/\.svg$/.test(entry.key)) {
                const iconPath = getIconPath(entry.value, options.assetsUrl);
                const { name, variant, theme } = getIconName(entry.key);

                if (!variant || !theme) {
                    return false;
                }

                ICONS_MAP[name] = mergeDeep(ICONS_MAP[name] || {}, {
                    [variant]: { [theme]: iconPath },
                });

                return {
                    key: name,
                    value: ICONS_MAP[name],
                };
            }

            return false;
        },
    });
}

module.exports = pluginMobicon;
