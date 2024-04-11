import React, { FC, useCallback, useRef, useState } from 'react';
import { cn } from '@bem-react/classname';

import { ButtonDefault } from '../button-default';
import { Icon } from 'components/icon';
import { Row } from 'components/row';

import { getDate } from 'helpers/utils';

import { basePath } from 'const';

import './index.scss';

export type DateRange = {
  createdGTE: number;
  createdLT: number;
};
export type DateRangeISOString = {
  createdGTE: string;
  createdLT: string;
};

type FilterCalendarProps = {
  selectData: (dateRange: DateRange) => void;
};

const cnFilterCalendar = cn('FilterCalendar');

// Заготовка компонента фильтра дат
export const FilterCalendar: FC<FilterCalendarProps> = ({ selectData }) => {
  const inputStartWithRef = useRef<HTMLInputElement>(null);
  const inputEndWithRef = useRef<HTMLInputElement>(null);

  const [startWithDataValue, setStartWithDataValue] = useState<number>(
    Date.now(),
  );
  const [endWithDataValue, setEndWithDataValue] = useState<number>(Date.now());

  const CalendarIcon = useCallback((className: string) => {
    return (
      <Icon
        className={className}
        size={36}
        url={`${basePath}/icons/calendar.svg`}
      />
    );
  }, []);

  const handleClick = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (
      inputRef &&
      inputRef.current &&
      'showPicker' in HTMLInputElement.prototype
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inputRef as any).current.showPicker();
    }
  };

  const handleChangeStartWithInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setStartWithDataValue(new Date(event.target.value).getTime());
      selectData({
        createdGTE: startWithDataValue,
        createdLT: endWithDataValue,
      });
    },
    [selectData, startWithDataValue, endWithDataValue],
  );

  const handleChangeEndWithInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEndWithDataValue(new Date(event.target.value).getTime());
      selectData({
        createdGTE: startWithDataValue,
        createdLT: endWithDataValue,
      });
    },
    [selectData, startWithDataValue, endWithDataValue],
  );

  return (
    <Row className={cnFilterCalendar()}>
      <Row>
        <ButtonDefault
          iconLeft={CalendarIcon}
          onClick={() => handleClick(inputStartWithRef)}
          className={cnFilterCalendar('Picker')}
        >
          {getDate(startWithDataValue)}
          <input
            type="date"
            ref={inputStartWithRef}
            className={cnFilterCalendar('Input')}
            onChange={(e) => handleChangeStartWithInput(e)}
          />
        </ButtonDefault>
      </Row>

      <Row className={cnFilterCalendar('Separator')}> – </Row>

      <Row>
        <ButtonDefault
          iconLeft={CalendarIcon}
          onClick={() => handleClick(inputEndWithRef)}
          className={cnFilterCalendar('Picker')}
        >
          {getDate(endWithDataValue)}
          <input
            type="date"
            ref={inputEndWithRef}
            className={cnFilterCalendar('Input')}
            onChange={(e) => handleChangeEndWithInput(e)}
          />
        </ButtonDefault>
      </Row>
    </Row>
  );
};
