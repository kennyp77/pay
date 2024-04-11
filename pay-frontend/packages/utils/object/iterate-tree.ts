import isArray from '@tinkoff/utils/is/array';
import isPlainObject from '@tinkoff/utils/is/plainObject';

// TODO: Уйти от рекурсии к while
export function iterateTree<V = any>(obj: V, keyFn: (key: string) => string, valFn: (value: any) => any): V {
    if (!isArray(obj) && !isPlainObject(obj)) {
        return valFn(obj);
    }

    const copy: any = isArray(obj) ? [] : {};

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(obj)) {
        copy[keyFn(key)] = iterateTree(value, keyFn, valFn);
    }

    return copy;
}
