import React, { FC, useCallback, useEffect, useState } from 'react';
import { cn } from '@bem-react/classname';
import { useDispatch, useSelector } from 'react-redux';

import { Suggest } from 'components/suggest';
import { Col } from 'components/col';
import { Text } from 'components/text';
import { registrationFirstStepFields } from 'helpers/fields';

import { GeoSuggestProps } from 'types/geo-type';

import { getGeoSelector, getErrorSelector } from 'store/geo-suggest/selectors';

import { fetchGeoRequest } from 'store/geo-suggest/actions';

interface SuggestProps {
  selectItem: (address?: string, item?: GeoSuggestProps) => void;
  addressText?: string;
  fieldName: string;
  disabled?: boolean;
  label?: string;
}

const cnSuggest = cn('Suggest');

export const GeoSuggest: FC<SuggestProps> = ({
  selectItem,
  addressText = '',
  fieldName,
  disabled,
  label,
}) => {
  const dispatch = useDispatch();
  const suggestList = useSelector(getGeoSelector);
  const errorDispatch = useSelector(getErrorSelector);
  const [activeItem, setActiveItem] = useState<string>('');
  const [enteredText, setEnteredText] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>(addressText);

  useEffect(() => {
    setInputValue(addressText);
  }, [addressText]);

  const handleSuggestItem = useCallback(
    (item: GeoSuggestProps | undefined) => {
      if (item) {
        selectItem(item.text, item);
      }

      let value;

      if (item) {
        value = item.text;
        setEnteredText(item.text);
      }
      if (value) {
        setActiveItem(value);
        setInputValue(value);
      }
    },
    [selectItem],
  );

  const suggestInputProps = () =>
    registrationFirstStepFields[
      fieldName as keyof typeof registrationFirstStepFields
    ];

  const suggestListItem = (item: GeoSuggestProps, index: number) => (
    <Col
      className={cnSuggest('item')}
      key={index}
      onClick={() => handleSuggestItem(item)}
    >
      <Text overflow="ellipsis" as="div" bottom={4} title={item.text}>
        {item.text}
      </Text>
    </Col>
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const notEqualValue = e.target.value.split(' ').join('') !== enteredText;

      if ((Boolean(enteredText) && Boolean(errorDispatch)) || notEqualValue) {
        handleSuggestItem(undefined);
      } else {
        setInputValue(activeItem);
      }
    },
    [activeItem, enteredText, errorDispatch, handleSuggestItem],
  );

  const emptySuggestItem = () => (
    <Col className={cnSuggest('item', { 'no-hover': true })}>
      <Text bottom={4}>Не удалось найти адрес</Text>
    </Col>
  );

  const fetchRequest = useCallback(
    (value: string) => {
      dispatch(fetchGeoRequest(value));
    },
    [dispatch],
  );

  return (
    <Suggest
      fetchRequest={fetchRequest}
      suggestList={suggestList}
      error={errorDispatch}
      suggestInputProps={suggestInputProps}
      suggestListItem={suggestListItem}
      emptySuggestItem={emptySuggestItem}
      inputValue={inputValue}
      onBlur={handleBlur}
      onInput={handleInput}
      disabled={disabled}
      label={label}
      instantFetch
    />
  );
};
