import React, { FC, useState } from 'react';
import { cn } from '@bem-react/classname';

import { RadioButton } from 'components/radio-button';

type FilterPeriodProps = unknown;

const cnFilterPeriod = cn('FilterPeriod');

const periodOptions = [
  { value: 'Сегодня', children: 'Сегодня' },
  { value: 'Неделя', children: 'Неделя' },
  { value: 'Месяц', children: 'Месяц' },
  { value: 'Квартал', children: 'Квартал' },
  { value: 'Год', children: 'Год' },
];

// Заготовка компонента фильтра аналитики по периоду
export const FilterPeriod: FC<FilterPeriodProps> = () => {
  const [value, setValue] = useState<string>(periodOptions[0].value);

  return (
    <RadioButton
      className={cnFilterPeriod()}
      size="m"
      view="default"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setValue(e.target.value)
      }
      options={periodOptions}
    />
  );
};
