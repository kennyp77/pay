const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

function pluginSvgIcons() {
    return new SpriteLoaderPlugin({ plainSprite: true });
}

module.exports = pluginSvgIcons;
