import React, { FC, useCallback, useEffect, useState } from 'react';
import { cn } from '@bem-react/classname';
import { useDispatch, useSelector } from 'react-redux';

import { Suggest } from 'components/suggest';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Text } from 'components/text';

import { registrationFirstStepFields } from 'helpers/fields';
import { PartnerDataProps } from 'types/partners-type';

import { getPartnerDataSelector } from 'store/partner-data/selectors';
import {
  getPartnersSuggestSelector,
  getErrorSelector,
} from 'store/partner-suggest/selectors';

import { setPartnerDataRequest } from 'store/partner-data/actions';
import { fetchPartnerRequest } from 'store/partner-suggest/actions';

import { toTextMask } from 'helpers/utils';

interface SuggestProps {
  error?: string;
  touched?: boolean;
  selectItem: (isNew?: boolean, inn?: string, item?: PartnerDataProps) => void;
  isEditing: boolean;
  disabled?: boolean;
}

const cnSuggest = cn('Suggest');

export const PartnersSuggest: FC<SuggestProps> = ({
  selectItem,
  isEditing,
  disabled,
}) => {
  const dispatch = useDispatch();
  const suggestList = useSelector(getPartnersSuggestSelector);
  const errorDispatch = useSelector(getErrorSelector);
  const partnerData = useSelector(getPartnerDataSelector);

  const [activeItem, setActiveItem] = useState<string>('');
  const [enteredText, setEnteredText] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (isEditing) {
      setInputValue(enteredText);
    }
  }, [isEditing, enteredText]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setEnteredText(e.target.value);
  }, []);

  const handleSuggestItem = useCallback(
    (item: PartnerDataProps | undefined, isNew = false) => {
      selectItem(isNew, inputValue, item);
      let value = '';
      if (!errorDispatch && item) {
        if (!isEditing) {
          value = `${item.name} • ИНН ${toTextMask(item.inn, 4)}`;
        } else {
          value = inputValue;
        }
        setEnteredText(item.inn);
      } else {
        value = enteredText;
      }
      setActiveItem(value);
      setInputValue(value);

      if (!errorDispatch && item) {
        dispatch(setPartnerDataRequest(item));
      } else {
        dispatch(
          setPartnerDataRequest({
            ...partnerData,
            name: '',
            ogrn: '',
            kpp: '',
            address: '',
            full_name: '',
            leader_name: '',
            email: '',
            phone: '',
            site: '',
            correspondence_address: '',
            inn: partnerData?.inn || '',
            terms: partnerData?.terms || false,
            is_new_inn: isNew,
          }),
        );
      }
    },
    [
      selectItem,
      inputValue,
      errorDispatch,
      isEditing,
      enteredText,
      dispatch,
      partnerData,
    ],
  );

  const handleFocus = useCallback(() => {
    setInputValue(enteredText);
  }, [enteredText]);

  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const notEqualValue = e.target.value !== partnerData?.inn;

      if (
        (Boolean(enteredText) && Boolean(errorDispatch)) ||
        (notEqualValue && isEditing)
      ) {
        handleSuggestItem(undefined, true);
      } else if (!isEditing) {
        setInputValue(activeItem);
      }
    },
    [
      activeItem,
      enteredText,
      errorDispatch,
      handleSuggestItem,
      isEditing,
      partnerData,
    ],
  );

  const suggestInputProps = () =>
    !isEditing
      ? { ...registrationFirstStepFields.company_title_or_inn }
      : { ...registrationFirstStepFields.inn };

  const suggestListItem = (item: PartnerDataProps, index: number) => (
    <Col
      className={cnSuggest('item')}
      key={index}
      onClick={() => handleSuggestItem(item, false)}
    >
      <Text overflow="ellipsis" as="div" bottom={4} title={item.full_name}>
        {item.full_name}
      </Text>
      <Row gap={16} className={cnSuggest('item-info')}>
        <Text
          variant="label"
          overflow="ellipsis"
          title={`ИНН ${toTextMask(item.inn, 4)}`}
        >
          ИНН {toTextMask(item.inn, 4)}
        </Text>
        <Text variant="label" overflow="ellipsis" title={item.address}>
          {item.address}
        </Text>
      </Row>
    </Col>
  );

  const emptySuggestItem = () => (
    <Col className={cnSuggest('item', { 'no-hover': true })}>
      <Text bottom={4}>Не удалось найти организацию</Text>
      <Text variant="label">Попробуйте указать ИНН организации</Text>
    </Col>
  );

  const fetchRequest = useCallback(
    (value: string) => {
      dispatch(fetchPartnerRequest(value));
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
      onFocus={handleFocus}
      disabled={disabled}
    />
  );
};
