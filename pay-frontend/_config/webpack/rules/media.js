const assert = require('assert');
const path = require('path');

const { rootPath } = require('../../paths');
const { ensureSlash } = require('../utils');

const runtimeGeneratorPath = path.join(__dirname, './svg-loader/runtime-generator');
const yandexLegoPath = path.resolve(rootPath(), 'node_modules', '@yandex-lego');

function ruleMedia(include, options = {}) {
    assert(options.filename, 'Required filename option');

    const { dir: svgSpritePath } = path.parse(options.filename);
    const svgSpriteFilename = 'sprite.svg';

    return [
        {
            test: options.svgSprite
                ? /\.(gif|png|jpe?g|ogg|mp3|eot|ttf|woff|woff2)$/
                : /\.(gif|png|jpe?g|svg|ogg|mp3|eot|ttf|woff|woff2)$/,
            include,
            type: 'asset/resource',
            generator: {
                filename: options.filename,
            },
            sideEffects: true,
        },
        {
            test: /\.svg$/,
            include: [yandexLegoPath],
            use: [
                {
                    loader: 'svg-url-loader',
                    options: {
                        encoding: 'base64',
                    },
                },
            ],
        },
        {
            test: /\.svg$/,
            include,
            use: [
                options.svgSprite && {
                    loader: 'svg-sprite-loader',
                    options: {
                        extract: true,
                        publicPath: ensureSlash(svgSpritePath, true),
                        spriteFilename: () => svgSpriteFilename,
                        runtimeGenerator: runtimeGeneratorPath,
                    },
                },
                {
                    loader: 'svgo-loader',
                    options: {
                        floatPrecision: 2,
                        plugins: [
                            {
                                name: 'removeUnknownsAndDefaults',
                                active: false,
                            },
                            {
                                name: 'removeViewBox',
                                active: false,
                            },
                        ],
                    },
                },
            ].filter(Boolean),
        },
    ];
}

module.exports = ruleMedia;
