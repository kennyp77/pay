/**
 * Создает комбинации возможных объектов
 * по исходному объекту с массивом вариантов ключей
 *
 * Например:
 *   { keyA: ['A', 'a'], keyB: ['B', 'b'] }
 * Размножится в:
 * [
 *   { keyA: 'A', keyB: 'B' },
 *   { keyA: 'A', keyB: 'b' },
 *   { keyA: 'a', keyB: 'B' },
 *   { keyA: 'a', keyB: 'b' },
 * ]
 * @param obj
 * @returns {{}[]}
 */
// TODO: Поправить тайпиги — типизировать value
export function combine<V, T extends Record<string, V[]>>(obj: T): Record<keyof T, V>[] {
    const entries = Object.entries(obj);
    const keys = entries.map((entry) => entry[0]);
    const values = entries.map((entry) => entry[1]);

    const combinations = values.reduce((res, list) => res * (list.length || 1), 1);
    const result: Array<Record<keyof T, V>> = Array.from(
        { length: combinations },
        () => ({} as Record<keyof T, V>),
    );

    let frame = combinations;

    values.forEach((list, idxKey) => {
        const key: keyof T = keys[idxKey];
        const frameItem = frame / (list.length || 1);

        result.forEach((subObj, idx) => {
            subObj[key] = list[Math.floor((idx % frame) / frameItem)];

            return subObj[key];
        });
        frame = frameItem;
    });

    return result;
}
