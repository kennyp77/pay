import toArray from '@tinkoff/utils/array/toArray';
import pathOr from '@tinkoff/utils/object/pathOr';

export type Getter = <T>(path: string | string[], def?: T) => T;

export function createGetter(obj: unknown): Getter {
    return ((path, def = undefined) => pathOr(toArray(path), def, obj)) as Getter;
}
