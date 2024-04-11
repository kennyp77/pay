const path = require('path');
const snakeCase = require('@tinkoff/utils/string/snakeCaseName');

const getNamePart = (val) => snakeCase(val.join('-')).toUpperCase();

const VALID_VARIANTS = ['FULL', 'SHORT'];
const VALID_THEMES = ['LIGHT', 'DARK', 'MONO'];

function getIconName(src) {
    const parsedIconName = /_\/([a-z-]+)/.exec(src);

    if (!parsedIconName || !parsedIconName[1]) {
        throw new Error(`Unable to get icon name from src: ${src}`);
    }
    const iconName = parsedIconName[1];
    const iconNameParts = iconName.split('-');

    let name = getNamePart(iconNameParts.slice(0, -2));
    let variant = getNamePart(iconNameParts.slice(-2, -1));
    let theme = getNamePart(iconNameParts.slice(-1));

    if (!VALID_VARIANTS.includes(variant)) {
        variant = '';
    }

    if (!VALID_THEMES.includes(theme)) {
        theme = '';
    }

    if (!theme && !variant) {
        name = getNamePart(iconNameParts);
    }

    return {
        name,
        variant,
        theme,
    };
}

function getIconPath(filePath, assetsUrl) {
    const { origin, pathname } = new URL(
        assetsUrl.startsWith('//') ? `https:${assetsUrl}` : assetsUrl,
    );

    return `${origin}${path.join(pathname, filePath)}`;
}

module.exports = {
    getIconName,
    getIconPath,
};
