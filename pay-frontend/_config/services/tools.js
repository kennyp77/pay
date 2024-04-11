const path = require('path');

const trimEnd = require('lodash/trimEnd');

const mode = require('../mode');
const { BUCKET, USE_YASTATIC, PUBLIC_URL, RELEASE_TYPE } = require('../static/config');

const STATIC_FOLDER = 'static';
const FREEZE_FOLDER = '_';
const ASSET_HASH = mode.isProduction ? '.[contenthash:8]' : '';

function getSelfPath(publicPath) {
    return publicPath;
}

function getS3Host() {
    if (USE_YASTATIC) {
        return `yastatic.net/s3/${BUCKET}`;
    }

    if (PUBLIC_URL) {
        return `${BUCKET}.s3.yandex.net`;
    }

    return `${BUCKET}.s3.mds.yandex.net`;
}

function ensureEndSlash(pathStr) {
    return `${trimEnd(pathStr, '/')}/`;
}

function getS3PathPrefix() {
    if (RELEASE_TYPE === 'trunk') {
        return '__trunk';
    }

    if (RELEASE_TYPE === 'pr') {
        return '__pr';
    }

    return '';
}

function getS3Path(serviceName, pathSuffix = '') {
    // Убираем вложенность и спец-вимволы из названия пакета
    // @yandex-pay/sdk-payment-method => yandex-pay/sdk-payment-method'
    const s3Path = serviceName.replace(/[^\w-/]/g, '');
    const s3Prefix = getS3PathPrefix();

    return path.join(s3Prefix, s3Path, pathSuffix);
}

function createServiceConfig(options) {
    const distPath = path.join(options.path, 'dist');

    const build = {
        root: distPath,
        html: options.buildHtmlPath || distPath,
        favicon: path.join(distPath, FREEZE_FOLDER),
    };

    const assets = {
        js: `${STATIC_FOLDER}/[name]${ASSET_HASH}.js`,
        css: `${STATIC_FOLDER}/[name]${ASSET_HASH}.css`,
        static: `${STATIC_FOLDER}/[name]${ASSET_HASH}[ext]`,
        freeze: `${FREEZE_FOLDER}/[name]${ASSET_HASH}[ext]`,
        favicon: `${FREEZE_FOLDER}/favicon[ext]`,
    };

    let publicPath = ensureEndSlash(options.publicPath);
    let upload = {};

    if (mode.s3Static) {
        if (options.skipS3Static) {
            publicPath = ensureEndSlash(getSelfPath(options.publicPath));
        } else {
            publicPath = ensureEndSlash(`//${getS3Host()}/${getS3Path(options.name)}`);
            upload = {
                staticPath: path.join(build.root, STATIC_FOLDER),
                staticTarget: getS3Path(options.name, STATIC_FOLDER),
                freezePath: path.join(build.root, FREEZE_FOLDER),
                freezeTarget: getS3Path(options.name, FREEZE_FOLDER),
            };
        }
    }

    return {
        ...options,
        publicPath,
        build,
        assets,
        upload,
    };
}

module.exports = {
    createServiceConfig,
};
