import { toNum } from '@trust/utils/math';

const DEFAULT_PRECISION = 2;

export const isFree = (amount: string): boolean => {
    return Number(amount) === 0;
};

export const sumAmount = (...amounts: Sdk.Price[]): Sdk.Price => {
    const total = amounts.reduce((res, amount) => res + toNum(amount), 0);

    return total.toFixed(DEFAULT_PRECISION);
};

export const diffAmount = (amountA: Sdk.Price, amountB: Sdk.Price): Sdk.Price => {
    const total = toNum(amountA) - toNum(amountB);

    return total.toFixed(DEFAULT_PRECISION);
};

export const mulAmount = (...amounts: Sdk.Price[]): Sdk.Price => {
    const total = amounts.reduce((res, amount) => res * toNum(amount), 1);

    return total.toFixed(DEFAULT_PRECISION);
};
