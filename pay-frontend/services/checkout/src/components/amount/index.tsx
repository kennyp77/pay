import React from 'react';

import { cn } from '@bem-react/classname';
import { CURRENCY_SIGNS, CURRENCY_DIVIDERS } from '@trust/utils/currency';
import { roundAmount, toNum } from '@trust/utils/math';
import { formatThousands } from '@trust/utils/number-format';

import { Icon } from '../icons';

// TODO: пока не работает с fill="url"
import PlusIcon from './assets/plus-icon.svg';

import './styles.scss';

const cnAmount = cn('Amount');

interface AmountProps {
    amount: string;
    currency: string;
    fullFraction?: boolean;
}

const CURRENCY_SIGNS_WITH_PLUS: Record<string, string | JSX.Element> = {
    ...CURRENCY_SIGNS,
    PLUS: <Icon svg={PlusIcon} className={cnAmount('icon')} />,
};

// TODO: Проверить какие валюты и спользуем, и есть ли точность отличная от 2
const DEFAULT_PRECISION = 2;

const reduceAmount = (amount: string, maxVal: number, suffix: string): [number, string] => {
    const amountNum = toNum(amount);

    return amountNum >= maxVal
        ? [roundAmount(amountNum / maxVal, DEFAULT_PRECISION), suffix]
        : [amountNum, ''];
};

const getFullFraction = (fraction: string): string => {
    return fraction.padEnd(DEFAULT_PRECISION, '0');
};

export const Amount = ({ amount, currency, fullFraction }: AmountProps): JSX.Element => {
    const [number, suffix] = reduceAmount(amount, 10 ** 6, 'M');
    const [value, fraction] = formatThousands(Math.abs(number));
    const upperCurrency = currency.toUpperCase();
    const currencySign = CURRENCY_SIGNS_WITH_PLUS[upperCurrency] || String(upperCurrency);
    const sign = number < 0 ? '– ' : '';
    const divider = CURRENCY_DIVIDERS[upperCurrency] || CURRENCY_DIVIDERS.USD;

    const fractionPart = fullFraction ? `${divider}${getFullFraction(fraction)}` : '';

    return (
        <span className={cnAmount({ 'currency-icon': currency === 'PLUS' })}>
            {[sign, value, fractionPart, suffix].join('')} {currencySign}
        </span>
    );
};
