export function combineMaps(obj: Record<string, Array<any>>): Array<Record<string, any>> {
    const keys = Object.keys(obj);
    const values = Object.values(obj);

    const combinations = values.reduce((res, list) => res * (list.length || 1), 1);
    const result: Array<Record<string, any>> = Array.from({ length: combinations }, () => ({}));

    let frame = combinations;

    values.forEach((list, idxKey) => {
        const key = keys[idxKey];
        const frameItem = frame / (list.length || 1);

        result.forEach((subObj, idx) => {
            subObj[key] = list[Math.floor((idx % frame) / frameItem)];

            return subObj[key];
        });
        frame = frameItem;
    });

    return result;
}

export function addEach<T, M>(
    arr: Array<Record<string, T>>,
    addKey: string,
    addValue: M,
): Record<string, T | M>[] {
    return arr.map((record) => {
        return { ...record, [addKey]: addValue };
    });
}
