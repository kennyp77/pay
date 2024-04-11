type BaseOption = { value: number; items?: any[] };

export function getOptionByValue<T extends BaseOption, D>(
    list: T[],
    value: number | string,
    def: D,
): D | Sys.Return<T>['items'] {
    const option = list.find((item) => item.value === Number(value));

    return option && option.items ? option.items : def;
}

export function getOptionsList<T extends BaseOption>(availableList: T[], values: number[]): T[] {
    const list = values
        .map((value) => availableList.find((item) => item.value === value))
        .filter(Boolean);

    if (list.length !== values.length) {
        throw new Error('Some value not found');
    }

    return list as T[];
}

export function createOptionIterator<T extends BaseOption>(
    list: T[],
    options: { freezeOnLast?: boolean } = {},
): () => null | Sys.Return<T>['items'] {
    const maxIdx = list.length - 1;
    let idx = -1;

    return () => {
        idx += 1;

        if (options.freezeOnLast) {
            idx = Math.min(idx, maxIdx);
        }

        const option = list[idx];

        return option && option.items ? option.items : null;
    };
}
