import React, { FC, useCallback, useState } from 'react';
import { cn } from '@bem-react/classname';
import { useFormikContext } from 'formik';

import { Suggest } from 'components/suggest';
import { Col } from 'components/col';
import { Text } from 'components/text';

import { services } from 'mocks/services';
import { registrationThirdStepFields } from 'helpers/fields';

interface SuggestProps {
  selectItem?: (item?: SuggestServiceItem) => void;
}

interface SuggestServiceItem {
  name: string;
}

const cnSuggest = cn('Suggest');

export const ServicesSuggest: FC<SuggestProps> = ({ selectItem }) => {
  const { setValues } = useFormikContext();
  const [inputValue, setInputValue] = useState<string>('');

  const { suggest_services_list: suggestServicesList } = services;
  const [filteredSuggestServicesList, setFilteredSuggestServicesList] =
    useState<SuggestServiceItem[]>(suggestServicesList);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSuggestItem = useCallback(
    (item: SuggestServiceItem) => {
      if (selectItem) {
        selectItem(item);
      }
      const value = item.name;
      setInputValue(value);
      setValues({
        anotherService: value,
      });
    },
    [selectItem, setValues],
  );

  const suggestInputProps = () => registrationThirdStepFields.anotherService;

  const suggestListItem = (item: SuggestServiceItem, index: number) => (
    <Col
      className={cnSuggest('item')}
      key={index}
      onClick={() => handleSuggestItem(item)}
    >
      <Text overflow="ellipsis" as="div">
        {item.name}
      </Text>
    </Col>
  );

  const fetchRequest = useCallback(
    (value: string) => {
      const filteredServices = suggestServicesList.filter((service) =>
        service.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSuggestServicesList(filteredServices);
    },
    [suggestServicesList],
  );

  return (
    <Suggest
      fetchRequest={fetchRequest}
      suggestList={filteredSuggestServicesList}
      error={Boolean(filteredSuggestServicesList.length)}
      suggestInputProps={suggestInputProps}
      suggestListItem={suggestListItem}
      inputValue={inputValue}
      onInput={handleInput}
      instantFetch
    />
  );
};
