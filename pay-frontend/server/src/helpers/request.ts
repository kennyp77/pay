import _ from 'lodash';

import { Req } from '../typings/common';

export function getQuery(req: Req, name: string, def = ''): string {
    return _.get(req, ['query', name], def);
}

export function getRequestOrigin(req: Req): string {
    return `https://${req.headers.host || req.hostname || req.host}`;
}

export function getRequestUrl(req: Req): string {
    return `${getRequestOrigin(req)}${req.originalUrl}`;
}

export function getRequestBaseUrl(req: Req): string {
    return `${getRequestOrigin(req)}${req.baseUrl}`;
}

export function getReferer(req: Req): string {
    return req.headers.referer || '';
}

export function getRefererOrigin(req: Req): string {
    const { origin, referer } = req.headers;

    if (origin) {
        return origin;
    }

    try {
        const url = new URL(referer);

        return url.origin;
    } catch (err) {
        return getRequestOrigin(req);
    }
}
