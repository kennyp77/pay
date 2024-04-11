import prop from '@tinkoff/utils/object/prop';
import { getSearchParams } from '@trust/utils/url';

const getJsonFromUrl = <T>(param: string, def: T): T => {
    try {
        const value = prop(param, getSearchParams(window.location.href));

        return value ? JSON.parse(value) : def;
    } catch (err) {
        console.warn('Unable to parse JSON', err);

        return def;
    }
};

export function getScenario<T = any>(def: T) {
    return getJsonFromUrl('sheet', def);
}

export function getButton<T = any>(def: T) {
    return getJsonFromUrl('button-style', def);
}

export function getButtonStyles<T = any>(def: T) {
    return getJsonFromUrl('button-custom-style', def);
}
