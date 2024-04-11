import React from 'react';

import { CURRENCY_SIGNS } from '@trust/utils/currency';
import { roundAmount, toNum } from '@trust/utils/math';
import { formatThousands } from '@trust/utils/number-format';

interface AmountProps {
    amount: string;
    currency: string;
}

// TODO: Проверить какие валюты и спользуем, и есть ли точность отличная от 2
const DEFAULT_PRECISION = 2;

const reduceAmount = (amount: string, maxVal: number, suffix: string): [number, string] => {
    const amountNum = toNum(amount);

    return amountNum >= maxVal ? [roundAmount(amountNum / maxVal, DEFAULT_PRECISION), suffix] : [amountNum, ''];
};

export default function Amount({ amount, currency }: AmountProps): JSX.Element {
    const [number, suffix] = reduceAmount(amount, 10 ** 6, 'M');
    const [value, fraction] = formatThousands(number);
    const upperCurrency = currency.toUpperCase();
    const sign = CURRENCY_SIGNS[upperCurrency] || String(upperCurrency);

    return <>{`${value}${fraction ? `.${fraction}` : ''}${suffix} ${sign}`}</>;
}
