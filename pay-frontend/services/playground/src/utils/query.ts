import clone from '@tinkoff/utils/clone';
import isArray from '@tinkoff/utils/is/array';
import isBoolean from '@tinkoff/utils/is/boolean';
import isNumber from '@tinkoff/utils/is/number';
import isString from '@tinkoff/utils/is/string';

const QUERY_SEPARATOR = ',';

function listFromQuery<V extends number[]>(value: null | string, stub: V): V {
    const list = isString(value) ? value.split(QUERY_SEPARATOR) : [];

    return stub.map((def, idx) => {
        const num = Number(list[idx]);

        return isNaN(num) ? def : num;
    }) as V;
}

function listToQuery<T = number>(values: number[]): string {
    return values.join(QUERY_SEPARATOR);
}

export function stateFromQuery<T>(defaultState: T): T {
    const query = new URLSearchParams(window.location.search);
    const state: T = clone(defaultState);

    for (const [name, def] of Object.entries(state)) {
        const value = query.get(name) || def;

        if (isBoolean(def)) {
            // @ts-ignore
            state[name] = Boolean(Number(value));
        } else if (isNumber(def)) {
            // @ts-ignore
            state[name] = Number(value);
        } else if (isArray(def)) {
            // @ts-ignore
            state[name] = listFromQuery(value, def);
        } else {
            // @ts-ignore
            state[name] = value;
        }
    }

    return state;
}

export function stateToQuery<T>(state: T): string {
    const query = new URLSearchParams(window.location.search);

    for (const [name, value] of Object.entries(state)) {
        if (isBoolean(value)) {
            query.set(name, Number(value).toString());
        } else if (isNumber(value)) {
            query.set(name, value.toString());
        } else if (isArray(value)) {
            query.set(name, listToQuery(value));
        } else {
            query.set(name, value);
        }
    }

    return query.toString();
}
