import { FC, useMemo } from 'react';

import { Col } from 'components/col';
import { Row } from 'components/row';

import { FilterCalendar } from 'features/global/filters/filter-calendar';
import { FilterDropdown } from 'features/global/filters/filter-dropdown';
import { FilterSearch } from 'features/global/filters/filter-search';

import { paymentHeading } from 'mocks/payments';

import { FiltersType } from '../payments-list';
import { basePath } from 'const';

type FiltersProps = {
  setFilter: (newFilter: FiltersType) => void;
};

export const Filters: FC<FiltersProps> = ({ setFilter }) => {
  const [dropdownOptions, dropdownValues] = useMemo(() => {
    const options = paymentHeading.map((column) => {
      return {
        content: column.title,
        value: column.columnId,
      };
    });

    const values = paymentHeading.map((column) => {
      return column.columnId;
    });

    return [options, values];
  }, []);

  return (
    <Row justify="between" gap={8} bottom={32}>
      <Col>
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
      </Col>
      <Col>
        <Row gap={8}>
          <FilterSearch
            onChange={(value) => {
              setFilter({
                search: value,
              });
            }}
          />

          {/* TODO: Отключено перед первым выпуском в прод. Позже вернуть обратно
          <FilterDropdown
            buttonText="Все виды оплат"
            options={[{ content: 'Yandex Pay', value: 'Yandex Pay' }]}
            hasDropdownIcon
            onSelect={(values) => {
              setFilter({
                payments: values,
              });
            }}
          />
          */}

          <FilterDropdown
            options={dropdownOptions}
            iconUrl={`${basePath}/icons/settings.svg`}
            onBlur={(values) => {
              setFilter({
                headings: values,
              });
            }}
            defaultValues={dropdownValues}
          />
        </Row>
      </Col>
    </Row>
  );
};
