import * as React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@bem-react/classname';

import { geoSuggest, GeoSuggestOptions } from '../../api/geo-suggest';
import { FormBlurEvent, FormChangeEvent, FormFocusEvent } from '../form/events';
import { InputProps } from '../input';
import { InputWithSuggest } from '../input-with-suggest';
import { MenuItem } from '../menu';

import { AddressSuggestItem } from './address-suggest-item';

export type AddressSelectorValue = string;

interface SuggestItemValue {
    text: string;
    isHouse: boolean;
}

export interface AddressSelectorProps
    extends Omit<InputProps, 'value' | 'onChange' | 'onBlur' | 'onFocus'> {
    id?: string;
    name?: string;
    className?: string;

    searchType: GeoSuggestOptions['searchType'];

    value?: AddressSelectorValue;
    onChange?(e: FormChangeEvent<AddressSelectorValue>): void;

    onSelect?(value: string): void;

    onBlur?(e: FormBlurEvent): void;
    onFocus?(e: FormFocusEvent): void;
}

const DEBOUNCE_TIMEOUT = 350;

export const cnAddressSelector = cn('AddressSelector');

export const AddressSelector = memo(function AddressSelector(props: AddressSelectorProps) {
    const {
        id,
        name,
        className,
        value,
        onChange,
        onBlur,
        onFocus,
        onSelect,
        searchType = 'house',
        ...inputProps
    } = props;

    const inputControlRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>(value || '');
    const [selected, setSelected] = useState<SuggestItemValue>();
    const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);

    const onMenuOpen = useCallback(() => {
        setIsMenuOpen(true);

        const event = new FormFocusEvent(id, name);
        onFocus?.(event);
    }, [id, name, onFocus]);

    const onMenuClose = useCallback(() => {
        setIsMenuOpen(false);

        const event = new FormBlurEvent(id, name);
        onBlur?.(event);
    }, [id, name, onBlur]);

    const fetchSuggestItems = useCallback(
        async (query: string) => {
            try {
                setIsLoading(true);

                const { results } = await geoSuggest(query, {
                    searchType,
                });
                const items = results.map((item) => ({
                    value: {
                        text: item.text,
                        isHouse: item.tags.includes('house'),
                    } as SuggestItemValue,
                    content: (
                        <AddressSuggestItem title={item.title.text} subtitle={item.subtitle.text} />
                    ),
                }));

                setSuggestedItems(items);
            } finally {
                setIsLoading(false);
            }
        },
        [searchType],
    );

    const onInputChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchText(e.target.value);
            setSelected(undefined);

            if (!e.target.value) {
                return setSuggestedItems([]);
            }

            return fetchSuggestItems(e.target.value);
        },
        [fetchSuggestItems],
    );

    const onMenuChange = useCallback(
        async (itemValue: SuggestItemValue) => {
            setSearchText(itemValue.text);
            setSelected(itemValue);

            if (itemValue.isHouse || searchType === 'any') {
                const event = new FormChangeEvent(itemValue.text, id, name);
                onChange?.(event);

                setIsMenuOpen(false);
            } else {
                inputControlRef.current?.focus();
                await fetchSuggestItems(itemValue.text);
            }
        },
        [id, name, onChange, fetchSuggestItems, searchType],
    );

    useEffect(() => {
        if (selected && onSelect) {
            onSelect(selected.text);
        }
    }, [onSelect, selected]);

    return (
        <InputWithSuggest<SuggestItemValue>
            id={id}
            name={name}
            className={cnAddressSelector({}, [className])}
            //
            isLoading={isLoading}
            //
            value={selected}
            onChange={onMenuChange}
            //
            inputProps={{
                autoComplete: 'off',
                className: cnAddressSelector('Control'),
                ...inputProps,
                controlRef: inputControlRef,
                debounceTimeout: DEBOUNCE_TIMEOUT,
            }}
            inputValue={searchText}
            onInputChange={onInputChange}
            //
            menuProps={{
                className: cnAddressSelector('Menu'),
                view: 'default',
                size: 'm',
            }}
            menuItems={suggestedItems}
            menuIsOpen={isMenuOpen && suggestedItems.length > 0}
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
        />
    );
});
