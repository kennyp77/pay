const { ensureSlash } = require('../../utils');

const { PLUGIN_NAME, HTML_WEBPACK_PLUGIN } = require('./constants');
const htmlTools = require('./html-tools');
const { hasProp } = require('./utils');

/* eslint-disable no-param-reassign */

/**
 * Плагин для вставки RUM счетчиков
 *
 * Для RUM счетчиков надо:
 *    - часть кода инлайнить в формате yate в head
 *    - остальной бандл добавлять в конец
 *    - расставить counterId для ресурсов
 *
 *    Делать это через готовые плагины нельзя — планигины не покрывают всех потребностей.
 *    Проще набросать свой плагин которй делает что нужно,
 *    чем что-то менять в архитектуре на данный момент.
 *
 *    Плагин умеет:
 *    - сортировать ресурсы (как с начала так и с конца)
 *    - вставлять ресурсы в head / body
 *    - инлайнить ресурсы
 *    - проставлять аттрибут data-rCid
 */

/**
 * Возвращает publicPath из настроек Webpack
 * @return {string}
 */
function getPublicPath(compiler) {
    const { output } = compiler && compiler.options ? compiler.options : {};

    if (output && output.publicPath) {
        return ensureSlash(output.publicPath, true);
    }

    return '';
}

/**
 * @typedef {Object} HtmlAssetsPluginInlineAsset
 * @property {string} content
 */

/**
 * @typedef {Object} HtmlAssetsPluginOptions
 * @property {string} publicPath
 * @property {TagsGeneratorTagRule[]} head
 * @property {TagsGeneratorTagRule[]} body
 * @property {string[]} order
 * @property {Object.<string, HtmlAssetsPluginInlineAsset>=} customAssets
 */

/**
 * Нормализует конфиг плагина
 * @param {HtmlAssetsPluginOptions} options
 * @return {HtmlAssetsPluginOptions}
 */
function normalizeOptions(options) {
    options.favicon = options.favicon || {};
    options.head = options.head || [];
    options.body = options.body || [];
    options.order = options.order || [];

    options.publicPath = hasProp(options, 'publicPath') ? options.publicPath : '';

    return options;
}

/**
 * Собственно сам плагин
 * Подключается к нужным хукам Webpack'a
 */
class HtmlAssetsWebpackPlugin {
    constructor(options) {
        this.options = normalizeOptions(options);
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, this.onCompilation);
        compiler.hooks.emit.tap(PLUGIN_NAME, this.onEmit);

        this.options.publicPath = getPublicPath(compiler);
        this.RawSource = compiler.webpack.sources.RawSource;
    }

    onCompilation = (compilation) => {
        const hooks = this.getHooks(compilation);

        hooks.beforeAssetTagGeneration.tap(
            PLUGIN_NAME,
            this.onBeforeHtmlGeneration.bind(this, compilation),
        );
        hooks.alterAssetTagGroups.tap(
            PLUGIN_NAME,
            this.onAlterAssetTagGroups.bind(this, compilation),
        );
        hooks.afterTemplateExecution.tap(
            PLUGIN_NAME,
            this.afterHtmlProcessingCallback.bind(this, compilation),
        );
    };

    getHooks(compilation) {
        const HtmlWebpackPlugin = require(HTML_WEBPACK_PLUGIN);

        if (HtmlWebpackPlugin.getHooks) {
            const hooks = HtmlWebpackPlugin.getHooks(compilation);
            const hasHtmlPlugin = compilation.options.plugins.some(
                (plugin) => plugin instanceof HtmlWebpackPlugin,
            );

            return hasHtmlPlugin ? hooks : null;
        } else {
            const message =
                "Error running html-webpack-tags-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
            throw new Error(message);
        }
    }

    /**
     * Колбэек перед генерацией html
     */
    onBeforeHtmlGeneration = (compilation, htmlPluginData) => {
        const assets = htmlTools.generateCustomAssets(this.options.customAssets || {});

        assets.forEach(([filename, data, ext]) => {
            // Добавляем контент в ассеты вебпака
            compilation.assets[filename] = new this.RawSource(data);

            // Добавляем в ассеты html-плагина
            htmlPluginData.assets[ext].push(filename);

            compilation.hooks.moduleAsset.call({ userRequest: filename }, filename);
        });
    };

    /**
     * Колбэек перед вставкой тегов в html
     */
    onAlterAssetTagGroups = (compilation, pluginArgs, callback) => {
        const headTagName = hasProp(pluginArgs, 'headTags') ? 'headTags' : 'head';
        const bodyTagName = hasProp(pluginArgs, 'bodyTags') ? 'bodyTags' : 'body';

        const headTags = pluginArgs[headTagName];
        const bodyTags = pluginArgs[bodyTagName];

        try {
            const updatedTags = htmlTools.generateTags(this.options, compilation.assets, [
                ...headTags,
                ...bodyTags,
            ]);

            pluginArgs[headTagName] = updatedTags.head;
            pluginArgs[bodyTagName] = updatedTags.body;

            if (callback) {
                callback(null, pluginArgs);
            }
        } catch (err) {
            if (callback) {
                callback(err);
            } else {
                compilation.errors.push(err);
            }
        }
    };

    /**
     * Колбэек после генерации html
     */
    afterHtmlProcessingCallback = (compilation, pluginArgs) => {
        return {
            ...pluginArgs,
            html: htmlTools.fixRumCounterAttrCase(pluginArgs.html),
        };
    };

    /**
     * Колбэек перед отправкой assets в output directory
     */
    onEmit = (compilation, callback) => {
        if (compilation) {
            compilation.assets = htmlTools.removeInlineAssets(this.options, compilation.assets);
        }

        if (callback) {
            callback();
        }
    };
}

/* eslint-enable no-param-reassign */

module.exports = HtmlAssetsWebpackPlugin;
