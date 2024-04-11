import React, { FC, useCallback, useMemo } from 'react';
import { cn } from '@bem-react/classname';

import { ButtonDefault } from '../button-default';
import { Col } from 'components/col';
import { Flex } from 'components/flex';
import { Form } from 'components/form';
import { Icon } from 'components/icon';

import { FormInput } from 'components/form-input';

import { basePath } from 'const';
import './index.scss';

type FilterSearchProps = {
  onChange: (value: string) => void;
};

const cnFilterSearch = cn('FilterSearch');

const searchInitialValues = {
  search: '',
};

export const FilterSearch: FC<FilterSearchProps> = ({ onChange }) => {
  const SearchIcon = useMemo(() => {
    return <Icon size={36} url={`${basePath}/icons/search.svg`} />;
  }, []);

  const onSearch = useCallback(
    ({ search }: { search: string }) => {
      onChange(search);
    },
    [onChange],
  );

  return (
    <Form initialValues={searchInitialValues} onSubmit={onSearch}>
      {(form) => {
        return (
          <Flex className={cnFilterSearch()}>
            <Col right={4}>
              <FormInput
                fieldName="search"
                value={form.search}
                className={cnFilterSearch('Searchinput')}
                variant="bordered"
                view="default"
                size="m"
                placeholder="Поиск по ID заказа"
                type="search"
                iconLeft={SearchIcon}
                canValidated={false}
              />
            </Col>
            <Col>
              <ButtonDefault type="submit">Найти</ButtonDefault>
            </Col>
          </Flex>
        );
      }}
    </Form>
  );
};
