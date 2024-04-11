import React, { FC, useMemo } from 'react';
import { cn } from '@bem-react/classname';

import { Text, TextProps } from 'components/text';

import './index.scss';

type PriceProps = {
  value: number | string;
  currencyVisible?: boolean;
  weight?: TextProps['weight'];
};

const digitPrice = 2;

const cnPrice = cn('Price');

export const Price: FC<PriceProps> = ({
  value,
  currencyVisible,
  weight = 400,
}) => {
  const priceParseFloat = useMemo(() => {
    const num: number = typeof value === 'number' ? value : parseFloat(value);
    return num.toLocaleString('ru-RU', {
      minimumFractionDigits: digitPrice,
      maximumFractionDigits: digitPrice,
      currency: 'RUB',
      style: currencyVisible ? 'currency' : 'decimal',
    });
  }, [currencyVisible, value]);

  const priceIntDigits = priceParseFloat.split(',')[0];
  const priceFractionDigits = priceParseFloat.split(',')[1];

  return (
    <React.Fragment>
      {value ? (
        <Text className={cnPrice()} weight={weight}>
          <span>{priceIntDigits}</span>
          <span className={cnPrice('FractionDigits')}>
            {`,${priceFractionDigits}`}
          </span>
        </Text>
      ) : null}
    </React.Fragment>
  );
};
