const path = require('path');

const pick = require('lodash/pick');
const toPairs = require('lodash/toPairs');

const { PLUGIN_NAME, RUM_COUNTER_ATTR } = require('./constants');
const { matches, getScriptName, getScriptPath, rewriteScriptPath } = require('./utils');

/* eslint-disable no-param-reassign */

/**
 * @typedef {string|RegExp|string[]|RegExp[]} TagsGeneratorAssetTest
 */

/**
 * @typedef {Object} TagsGeneratorAssetRewrite
 * @property {TagsGeneratorAssetTest} test
 * @property {string}                 path
 */

/**
 * @typedef {Object} TagsGeneratorTagRule
 * @property {TagsGeneratorAssetTest} test
 * @property {boolean}                inline
 * @property {string}                 rumCounterId
 */

/**
 * @typedef {Object} TagsGeneratorTag
 * @property {string} tagName
 * @property {boolean} closeTag It's probably should be `voidTag` instead
 * @property {Object.<string, string>} attributes
 * @property {string} innerHTML
 */

/** @typedef {import("webpack-sources").Source} Source */

/**
 * Генератор тэгов
 */
class HtmlToolsTagsGenerator {
    /**
     * @param {Object} options
     * @param {TagsGeneratorAssetRewrite[]} [options.assetsRewrite]
     * @param {TagsGeneratorTagRule[]}      options.head
     * @param {TagsGeneratorTagRule[]}      options.body
     * @param {string[]}                    options.order
     * @param {string}                      options.publicPath
     * @param {string}                      [options.inlineSvgSprite]
     * @param {Object.<string, Source>}     assets
     */
    constructor(options, assets) {
        this.options = options;
        this.assets = assets;
    }

    /**
     * Генерирует тэги для head / bodу
     * в соответствии с указанными в опциях правилами
     *
     * @template {TagsGeneratorTag} TTag
     * @param {TTag[]} tags
     * @return {{head: TTag[], body: TTag[]}}
     */
    generateTags(tags) {
        const { options } = this;
        const parsedTags = { head: [], body: [] };

        const sortedTags = this._sortTags(tags);
        const shouldRewritePath = options.assetsRewrite && options.assetsRewrite.length;

        parsedTags.head.push(...this._addFavicons());

        sortedTags.forEach((tag) => {
            let updated = false;

            if (shouldRewritePath) {
                options.assetsRewrite.forEach((rule) => {
                    if (matches(getScriptName(tag), rule.test)) {
                        tag.attributes.src = rewriteScriptPath(tag, rule.path);
                    }
                });
            }

            options.head.forEach((rule) => {
                if (!updated && matches(getScriptName(tag), rule.test)) {
                    updated = true;
                    parsedTags.head.push(this._updateTag(tag, rule));
                }
            });

            options.body.forEach((rule) => {
                if (!updated && matches(getScriptName(tag), rule.test)) {
                    updated = true;
                    parsedTags.body.push(this._updateTag(tag, rule));
                }
            });

            if (!updated) {
                parsedTags.body.push(tag);
            }
        });

        parsedTags.body.push(...this._inlineSvg());

        return parsedTags;
    }

    /**
     * Сортирует тэги в порядке указанном в конфиге
     * @private
     */
    _sortTags(tags) {
        const { options } = this;
        const order = options.order.slice();
        const indexOf = (tag) => order.findIndex((test) => matches(getScriptName(tag), test));

        return tags.sort((tagA, tagB) => {
            // eslint-disable-next-line no-bitwise
            const idxA = ~indexOf(tagA) || ~order.indexOf('*');
            // eslint-disable-next-line no-bitwise
            const idxB = ~indexOf(tagB) || ~order.indexOf('*');

            return idxB - idxA;
        });
    }

    /**
     * Применяет правила к тэгу
     * @private
     * @param {TagsGeneratorTag} tag
     * @param {TagsGeneratorTagRule} rule
     * @return {TagsGeneratorTag}
     */
    _updateTag(tag, rule) {
        if (rule.inline) {
            tag = this._replaceWithInline(tag);
        }

        if (rule.rumCounterId) {
            tag = this._addRumCounterId(tag, rule);
        }

        return tag;
    }

    /**
     * Добавляет RUM аттрибут к тэгу
     * @private
     * @param {TagsGeneratorTag} tag
     * @param {TagsGeneratorTagRule} rule
     * @return {TagsGeneratorTag}
     */
    _addRumCounterId(tag, rule) {
        tag.attributes = tag.attributes || {};
        tag.attributes[RUM_COUNTER_ATTR] = rule.rumCounterId;

        return tag;
    }

    /**
     * Инлайнит ресурс в тэге
     * @private
     * @param {TagsGeneratorTag} tag
     * @return {TagsGeneratorTag}
     */
    _replaceWithInline(tag) {
        const { options } = this;

        const scriptPath = getScriptPath(tag, options.publicPath);
        const asset = this.assets[scriptPath];

        if (!asset) {
            throw new Error(`${PLUGIN_NAME}: no asset with href '${scriptPath}'`);
        }

        return {
            tagName: tag.tagName,
            closeTag: tag.closeTag,
            attributes: pick(tag.attributes, ['type']),
            innerHTML: asset.source(),
        };
    }

    /**
     * Генерирует favicon тэги
     * @private
     */
    _addFavicons() {
        const { publicPath, favicon = {} } = this.options;

        const typeByExt = {
            svg: 'image/svg+xml',
        };

        return toPairs(favicon).map(([ext, filename]) => {
            return {
                tagName: 'link',
                voidTag: true,
                attributes: {
                    rel: 'icon',
                    type: typeByExt[ext],
                    href: `${publicPath}${filename.replace('[ext]', `.${ext}`)}`,
                },
            };
        });
    }

    /**
     * Генерирует тэги из ассетов для инлайна SVG
     * @private
     */
    _inlineSvg() {
        const { inlineSvgSprite } = this.options;

        if (!inlineSvgSprite) {
            return [];
        }

        const trimSvgTags = (content) => content.replace(/(^<svg .*?>)|(<\/svg>$)/g, '');

        return Object.keys(this.assets)
            .filter((assetPath) => matches(assetPath, inlineSvgSprite))
            .map((assetPath) => ({
                tagName: 'svg',
                closeTag: true,
                attributes: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    // NB: display: none отключает градиенты
                    style: 'position:absolute;top:-9999px;left:-9999px;visibility:hidden;height:0;width:0;overflow:hidden;',
                },
                innerHTML: trimSvgTags(this.assets[assetPath].source()),
            }));
    }
}

/**
 * Генерирует тэги по правилам
 * @param {Object} options
 * @param {Object.<string, Source>} assets
 * @param {TagsGeneratorTag[]} tags
 * @return {{head: TagsGeneratorTag[], body: TagsGeneratorTag[]}}
 */
function generateTags(options, assets, tags) {
    const htmlToolsTags = new HtmlToolsTagsGenerator(options, assets);

    return htmlToolsTags.generateTags(tags);
}

/**
 * Webpack приводит атрибуты к lowercase
 * Исправляет case аттрибутов, RUM счетчиков
 * @return {string}
 */
function fixRumCounterAttrCase(html) {
    const searchRegex = new RegExp(` ${RUM_COUNTER_ATTR}=`, 'gi');
    const replaceAttr = ` ${RUM_COUNTER_ATTR}=`;

    return html.replace(searchRegex, replaceAttr);
}

/**
 * Удаляет ассеты которые были заинлайнены
 * @param {Object} options
 * @param {TagsGeneratorTagRule[]} options.head
 * @param {TagsGeneratorTagRule[]} options.body
 * @param {Object.<string, Source>} assets
 * @return {Object.<string, Source>}
 */
function removeInlineAssets(options, assets) {
    const inlineRules = [...options.head, ...options.body].filter((rule) => rule.inline);

    return Object.keys(assets)
        .filter((assetName) => !inlineRules.some((rule) => matches(assetName, rule.test)))
        .reduce((nextAssets, assetName) => {
            nextAssets[assetName] = assets[assetName];

            return nextAssets;
        }, {});
}

/**
 * Генерирует кастомные ассеты
 *
 * @param {Object.<string, HtmlAssetsPluginInlineAsset>} assets
 * @return {[string][]}
 */
function generateCustomAssets(assets) {
    return Object.keys(assets).reduce((list, filename) => {
        const { content } = assets[filename];

        if (!content) {
            throw new Error(`No content found on '${filename}' custom asset`);
        }

        return [...list, [filename, content, path.extname(filename).slice(1)]];
    }, []);
}

/* eslint-enable no-param-reassign */

module.exports = {
    generateTags,
    fixRumCounterAttrCase,
    removeInlineAssets,
    generateCustomAssets,
};
