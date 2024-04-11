/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  FC,
  useCallback,
  useRef,
  useState,
  useEffect,
  ChangeEvent,
} from 'react';
import { cn } from '@bem-react/classname';
import debounce from 'lodash.debounce';

import { Block } from 'components/block';
import { Popup } from 'components/popup';

import { FormInput } from 'components/form-input';

import './index.scss';

type SuggestItem = (item: any, index: number) => void | JSX.Element;

interface SuggestProps {
  suggestList: any[] | null;
  error: string | boolean | null;
  suggestInputProps: () => any;
  suggestListItem: SuggestItem;
  emptySuggestItem?: () => JSX.Element;
  fetchRequest: (value: string) => void;
  inputValue: string;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: ChangeEvent<HTMLInputElement>) => void;
  instantFetch?: boolean;
  disabled?: boolean;
  label?: string;
}

const cnSuggest = cn('Suggest');

export const Suggest: FC<SuggestProps> = ({
  suggestList,
  error,
  suggestInputProps,
  suggestListItem,
  emptySuggestItem,
  fetchRequest,
  inputValue,
  onBlur,
  onInput,
  onFocus,
  instantFetch = false,
  disabled,
  label,
}) => {
  const [popupIsVisible, setPopupIsVisible] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [displayValue, setDisplayValue] = useState<string>('');

  const suggestWrapperRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchRequest(value);
    }, 300),
    [fetchRequest],
  );

  useEffect(() => {
    if (inputValue && instantFetch) {
      debouncedSearch(inputValue);
    }
  }, [debouncedSearch, inputValue, instantFetch]);

  useEffect(() => {
    setDisplayValue(inputValue);
  }, [inputValue]);

  const handleFocus = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPopupIsVisible(true);
      if (onFocus) {
        onFocus(e);
      }
    },
    [onFocus],
  );

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (onInput) {
        onInput(e);
      }
      setDisplayValue(e.target.value);
      setIsLoaded(true);
      if (e.target.value) {
        debouncedSearch(e.target.value);
        setPopupIsVisible(true);
      } else {
        setPopupIsVisible(false);
      }
    },
    [debouncedSearch, onInput],
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e);
      }
      setPopupIsVisible(false);
    },
    [onBlur],
  );

  const isEmpty =
    isLoaded && emptySuggestItem && suggestList
      ? Boolean(!suggestList.length || error)
      : undefined;

  return (
    <div className={cnSuggest()} ref={suggestWrapperRef}>
      <FormInput
        {...suggestInputProps()}
        bottom={20}
        autoComplete="none"
        value={displayValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        label={label ? label : suggestInputProps().label}
        placeholder={disabled ? '' : suggestInputProps().placeholder}
        disabled={disabled}
      />
      <Popup
        visible={popupIsVisible}
        nonvisual
        view="default"
        direction="bottom"
        className={cnSuggest('popup')}
        target="anchor"
        anchor={suggestWrapperRef}
        scope={suggestWrapperRef}
        mainOffset={0}
      >
        {suggestList || isEmpty ? (
          <Block className={cnSuggest('popup-wrapper')} shadow>
            {suggestList
              ? suggestList.map((item: any, index: number) =>
                  suggestListItem(item, index),
                )
              : null}
            {isEmpty && emptySuggestItem ? emptySuggestItem() : null}
          </Block>
        ) : null}
      </Popup>
    </div>
  );
};
