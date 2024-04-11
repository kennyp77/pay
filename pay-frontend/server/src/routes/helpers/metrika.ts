import _ from 'lodash';

import WebCore from './web-core';

const toArray = (arr: string | string[]): string[] => (_.isArray(arr) ? arr : [arr]);

type MetrikaParams = Record<string, any>;

interface MetrikaCounter<T extends MetrikaParams = {}> {
    (core: WebCore, data?: T, skipDT?: boolean): void;
}

export function metrikaSessionId(core: WebCore): string {
    return core.req.query.msid || 'no-sid';
}

export function metrikaCheckoutId(core: WebCore): string {
    return core.req.query.mcid || 'no-cid';
}

const params = (path: string[], data: MetrikaParams, skipDT = false): MetrikaParams => {
    return skipDT ? _.set({}, path, data) : _.set({}, path, { ...data, datetime: Date.now() });
};

const countSession =
    (name: string | string[]): MetrikaCounter =>
    (core, data = {}, skipDT = false): void => {
        const path = [metrikaSessionId(core)].concat(toArray(name));

        core.request('metrika/count', params(path, data, skipDT));
    };

const countCheckout =
    (name: string | string[]): MetrikaCounter =>
    (core, data = {}, skipDT = false): void => {
        const path = [metrikaSessionId(core), metrikaCheckoutId(core)].concat(toArray(name));

        core.request('metrika/count', params(path, data, skipDT));
    };

export const counters = {
    loginAttempt: (core: WebCore, counter = 0): void => {
        return countCheckout([`puid-null-${counter}`, 'login_attempt'])(core);
    },

    updateCookieAttempt: (core: WebCore, puid = 'null', counter = 0): void => {
        return countCheckout([`puid-${puid}-${counter}`, 'update_cookie_attempt'])(core);
    },

    initMeta: (core: WebCore, _data: { isAuth: boolean; pspUrl: string }): void => {
        const data = {
            auth_status: _data.isAuth ? 'authorized' : 'unauthorized',
            psp_url: _data.pspUrl,
        };

        return countSession(['meta'])(core, data, true);
    },

    track: (core: WebCore): void => {
        core.request('metrika/view', {});
    },
};
