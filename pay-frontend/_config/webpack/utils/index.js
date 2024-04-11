const path = require('path');

function requireWebpack(_path) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(path.resolve(__dirname, '..', _path));
}

function interpolate(str, data) {
    return Object.entries(data).reduce((res, [key, value]) => res.replace(`[${key}]`, value), str);
}

function ensureSlash(urlPath, needsSlash) {
    const hasSlash = urlPath.endsWith('/');

    if (hasSlash && !needsSlash) {
        return urlPath.substr(urlPath, urlPath.length - 1);
    }

    if (!hasSlash && needsSlash) {
        return `${urlPath}/`;
    }

    return urlPath;
}

module.exports = {
    interpolate,
    requireWebpack,
    ensureSlash,
};
