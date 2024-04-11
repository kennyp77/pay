import { logWarn } from '@trust/rum';

type Amount = number;

const DEFAULT_PRECISION = 2;

export const toNum = (val: string, def = 0): number => {
    const num = Number(val);

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(num)) {
        logWarn(`Unexpected NaN toNum='${val}'`);

        return def;
    }

    return num;
};

export function roundAmount(value: Amount, precision: number = DEFAULT_PRECISION): Amount {
    const decimalBase = 10 ** precision;

    return Math.round(value * decimalBase) / decimalBase;
}

export function amountSum(valA: Amount, valB: Amount): Amount {
    return roundAmount(valA + valB);
}

export function amountDiff(valA: Amount, valB: Amount): Amount {
    return roundAmount(valA - valB);
}
