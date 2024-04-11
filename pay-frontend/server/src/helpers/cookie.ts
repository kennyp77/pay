import _ from 'lodash';

import { Req } from '../typings/common';

export function getCookie(req: Req, name: string, def = ''): string {
    return _.get(req.cookies, name, def);
}

export function makeCookieHeader(req: Req): string {
    const { cookies = {} } = req;

    return Object.keys(cookies)
        .map((key) => `${key}=${cookies[key]}`)
        .join('; ');
}

export function getCookieHeader(req: Req): string {
    return _.has(req, 'cookies') ? makeCookieHeader(req) : _.get(req.headers, 'cookie', '');
}
