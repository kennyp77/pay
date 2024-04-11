import { getSource, getSearchParams, reloadWithSearchParams } from '@trust/utils/url';

const getInitialStart = (savingKey?: string): number | null => {
    if (!savingKey) return 0;

    const params = getSearchParams(getSource());

    return Number(params[savingKey]) || 0;
};

const _counter: Record<string, number> = {};

export function counter(group = '_', step = 1, start = 0): number {
    _counter[group] = (_counter[group] || start - step) + step;

    return _counter[group];
}

export const counterWithSaving = (group = '_', step = 1, start = 0, savingKey: string): number => {
    const newCount = counter(group, step, getInitialStart(savingKey) || start);

    reloadWithSearchParams({ [savingKey]: `${newCount + 1}` });

    return newCount;
};
