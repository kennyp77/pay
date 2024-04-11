import includes from '@tinkoff/utils/array/includes';
import curry from '@tinkoff/utils/function/curry';
import flip from '@tinkoff/utils/function/flip';
import prop from '@tinkoff/utils/object/prop';

export function contain<V>(arr: V[]) {
    return curry(flip<V, V[], boolean>(includes))(arr);
}

/**
 * Меняем элементы местами
 */
export function swap(list: Array<unknown>, idxA: number, idxB: number): void {
    if (idxA !== idxB && idxA >= 0 && idxA < list.length && idxB >= 0 && idxB < list.length) {
        const buff = list[idxA];

        // eslint-disable-next-line no-param-reassign
        list[idxA] = list[idxB];
        // eslint-disable-next-line no-param-reassign
        list[idxB] = buff;
    }
}

/**
 * Перемещаем элемент на новое место с сохранением порядка
 * move([D,A,B,C], 0, 3) => [A,B,C,D]
 */
export function move(list: Array<unknown>, idxFrom: number, idxTo: number): void {
    // NB: Тут юзаем while, и нужно избежать бесконечных циклов
    if (idxFrom >= 0 && idxFrom < list.length && idxTo >= 0 && idxTo < list.length) {
        const M = idxFrom < idxTo ? 1 : -1;

        while (idxFrom !== idxTo) {
            swap(list, idxFrom, idxFrom + M);

            // eslint-disable-next-line no-param-reassign
            idxFrom += M;
        }
    }
}

/**
 * Возвращает индекс минимального элемента
 */
export function findMinIndex(list: Array<unknown>): number {
    let idx = list.length ? 0 : -1;

    for (let i = 0; i < list.length; i++) {
        if (list[i] <= list[idx]) {
            idx = i;
        }
    }

    return idx;
}

/**
 * Возвращает объект на основе массива
 */
// TODO: Поправить тайпинги позже
export function arrayToObj(
    list: Array<unknown>,
    keyProp: string,
    valueProp?: string,
): Record<string, unknown> {
    const obj: Record<any, any> = {};

    for (let i = 0; i < list.length; i++) {
        const key = prop(keyProp, list[i]) as undefined | string;

        if (key) {
            obj[key] = valueProp ? prop(keyProp, list[i]) : list[i];
        }
    }

    return obj;
}
