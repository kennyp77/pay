import { parseJson } from '../utils/parse-json';

export function getFromSessionStorage<T>(key: string, def: T): T {
    const value = window.sessionStorage.getItem(key);
    if (!value) {
        return def;
    }

    return parseJson(value, def);
}

export function setToSessionStorage(key: string, value: unknown) {
    window.sessionStorage.setItem(key, JSON.stringify(value));
}
