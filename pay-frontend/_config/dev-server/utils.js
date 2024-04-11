const { URL } = require('url');

const { resolveServer } = require('../paths');
const { WORKER_HOST, getService, getServiceIdx } = require('../services');

function getServiceUrl(serviceName) {
    const service = getService(serviceName);

    if (service.url) {
        return new URL(service.url);
    }

    const url = new URL(WORKER_HOST);

    if (!url.port) {
        throw new Error('Client port is undefined');
    }

    url.port = (Number(url.port) + getServiceIdx(serviceName)).toFixed();

    return url;
}

function hasDuffmanDest(serviceName) {
    const service = getService(serviceName);

    return service.build.html && service.build.html.startsWith(resolveServer(''));
}

function getProxyPath(publicPath) {
    if (publicPath[publicPath.length - 1] === '/') {
        return publicPath.substring(0, publicPath.length - 1);
    }

    return publicPath;
}

function setProxyPath(sourceUrl, targetPath) {
    const [_, searchParams] = sourceUrl.split('?');

    if (searchParams) {
        return `${targetPath}?${searchParams}`;
    }

    return targetPath;
}

module.exports = {
    getServiceUrl,
    hasDuffmanDest,
    getProxyPath,
    setProxyPath,
};
