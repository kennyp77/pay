import { FC, useMemo } from 'react';

import { Col } from 'components/col';
import { Row } from 'components/row';
import { Text } from 'components/text';

import { FilterCalendar } from 'features/global/filters/filter-calendar';
import { FilterDropdown } from 'features/global/filters/filter-dropdown';

//import { FiltersType } from '../payments-list';

type FiltersProps = {
  setFilter: (newFilter: any) => void;
};

export const Filters: FC<FiltersProps> = ({ setFilter }) => {
  return (
    <Row justify="between" gap={8} bottom={32}>
      <Col>
        <Text variant="header_m">Предыдущие счета</Text>
      </Col>
      <Col>
        <Row gap={8}>
          <FilterCalendar
            selectData={(dateRange) => {
              setFilter({
                dateRange: {
                  createdGTE: new Date(dateRange.createdGTE).toISOString(),
                  createdLT: new Date(dateRange.createdLT).toISOString(),
                },
              });
            }}
          />
          <FilterDropdown
            buttonText="Все статусы"
            options={[
              { content: 'На оплату', value: 'На оплату' },
              { content: 'Задолженность', value: 'Задолженность' },
              { content: 'Оплачен', value: 'Оплачен' },
            ]}
            hasDropdownIcon
            onSelect={(values) => {
              setFilter({
                bills: values,
              });
            }}
          />
        </Row>
      </Col>
    </Row>
  );
};
