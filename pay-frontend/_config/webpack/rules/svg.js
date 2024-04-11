const assert = require('assert');
const path = require('path');

const { rootPath } = require('@yandex-pay/config/paths');

const { ensureSlash } = require('../utils');

const runtimeGeneratorPath = path.join(__dirname, './svg-loader/runtime-generator');
const yandexLegoPath = path.resolve(rootPath(), 'node_modules', '@yandex-lego');

const svgoLoader = {
    loader: 'svgo-loader',
    options: {
        floatPrecision: 2,
    },
};

function ruleSvg(include, options = {}) {
    // assert(options.filename, 'Required filename option');
    const {
        include: spriteInclude = include,
        exclude: spriteExclude = [],
        filename: spriteFilename = '',
    } = options.sprite || {};

    const hasSprite = spriteInclude.length && spriteFilename;

    assert(
        !options.sprite || (options.sprite && spriteFilename),
        'Required both spriteInclude and spriteFilename options',
    );
    assert(
        spriteInclude && Array.isArray(spriteInclude),
        'options.sprite.include must be an array',
    );
    assert(
        spriteExclude && Array.isArray(spriteExclude),
        'options.sprite.exclude must be an array',
    );

    const { dir: svgSpritePath, base: svgSpriteFilename } = path.parse(spriteFilename);

    return [
        {
            test: /\.svg$/,
            include: [yandexLegoPath],
            type: 'asset/inline',
            use: [svgoLoader],
            sideEffects: true,
        },
        {
            test: /\.svg$/,
            include: [...spriteExclude, ...include],
            exclude: (path) => {
                if (path.includes(yandexLegoPath)) {
                    return true;
                }

                if (hasSprite && spriteExclude.some((excPath) => path.includes(excPath))) {
                    return false;
                }

                return hasSprite && spriteInclude.some((incPath) => path.includes(incPath));
            },
            type: 'asset/resource',
            generator: {
                filename: options.filename,
                publicPath: options.publicPath,
                outputPath: options.outputPath,
            },
            use: [svgoLoader],
        },
        hasSprite && {
            test: /\.svg$/,
            include: spriteInclude,
            exclude: spriteExclude,
            use: [
                {
                    loader: 'svg-sprite-loader',
                    options: {
                        extract: true,
                        publicPath: ensureSlash(svgSpritePath, true),
                        spriteFilename: () => svgSpriteFilename,
                        runtimeGenerator: runtimeGeneratorPath,
                    },
                },
                svgoLoader,
            ],
        },
    ].filter(Boolean);
}

module.exports = ruleSvg;
