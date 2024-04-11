import * as React from 'react';
import { ReactElement, useCallback, useRef, useState } from 'react';

import { cn } from '@bem-react/classname';
import difference from '@tinkoff/utils/array/difference';
import toArray from '@tinkoff/utils/array/toArray';

import { Input, InputProps } from '../input';
import { Menu, MenuChangeEvent, MenuItem, MenuProps } from '../menu';
import { OutsideClickWrapper } from '../outside-click-wrapper';
import { Popup, PopupDirection } from '../popup';
import { Row } from '../row';
import { Tag } from '../tag';

type OnChange<Value> = (value: Value) => void;

export interface InputWithSuggestProps<Value> {
    className?: string;

    id?: string;
    name?: string;
    controlRef?: React.RefObject<HTMLSelectElement>;

    isLoading?: boolean;
    isMultiple?: boolean;

    value?: Value;
    onChange?: OnChange<Value>;

    inputProps?: Omit<InputProps, 'value' | 'onChange' | 'onFocus' | 'onBlur'> & {
        onFocus?(e?: React.FocusEvent<HTMLInputElement>): void;
        onBlur?(e?: React.FocusEvent<HTMLInputElement>): void;
        onKeyDown?(e?: React.KeyboardEvent<HTMLInputElement>): void;
    };
    inputValue?: string;
    onInputChange?: React.ChangeEventHandler<HTMLInputElement>;

    menuProps?: Omit<MenuProps, 'items'>;
    menuItems: MenuItem[];
    menuIsOpen?: boolean;
    onMenuOpen?(): void;
    onMenuClose?(): void;
}

const cls = cn('input-with-suggest');

const POPUP_DIRECTIONS: PopupDirection[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];

export const InputWithSuggest = function InputWithSuggest<Value>(
    props: InputWithSuggestProps<Value>,
): ReactElement {
    const {
        id,
        name,
        className,
        controlRef,
        isMultiple,
        isLoading,
        //
        value,
        onChange,
        //
        inputProps,
        inputValue,
        onInputChange,
        //
        menuProps,
        menuIsOpen,
        menuItems,
        onMenuOpen,
        onMenuClose,
    } = props;

    const innerRef = useRef<HTMLDivElement>(null);
    const inputInnerRef = useRef<HTMLSpanElement>(null);

    const [menuWidth, setMenuWidth] = useState('auto');

    const onFocus = useCallback(
        (e?: React.FocusEvent<HTMLInputElement>) => {
            inputProps?.onFocus?.(e);

            const width = inputInnerRef.current?.getBoundingClientRect().width;
            if (width) {
                setMenuWidth(`${width}px`);
            }

            onMenuOpen?.();
        },
        [inputProps, onMenuOpen],
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            inputProps?.onKeyDown?.(e);

            if (e.code === 'Escape' || e.code === 'Tab') {
                onMenuClose?.();
            }
        },
        [inputProps, onMenuClose],
    );

    const onMenuChange = useCallback(
        (e: MenuChangeEvent<HTMLElement>) => {
            let nextValue = e.target.value;

            onChange?.(nextValue);
        },
        [onChange],
    );

    const onRemove = useCallback(
        (removeValue: Value) => {
            return () => {
                (onChange as unknown as OnChange<Value[]>)(
                    difference(toArray(value), toArray(removeValue)),
                );
            };
        },
        [value, onChange],
    );

    const renderTags = useCallback((): React.ReactNode => {
        const tags: MenuItem[] = [];
        for (let v of value as unknown as Value[]) {
            const tag = menuItems.find((item) => item.value === v);
            if (tag) {
                tags.push(tag);
            }
        }

        return tags.map((tag) => (
            <Tag key={tag.value} onClose={onRemove(tag.value)}>
                {tag.content}
            </Tag>
        ));
    }, [value, menuItems, onRemove]);

    return (
        <div className={cls({}, [className])} ref={innerRef}>
            <OutsideClickWrapper
                targetRef={innerRef}
                visible={menuIsOpen}
                onOutsideClick={onMenuClose}
            >
                <select
                    id={id}
                    name={name}
                    value={JSON.stringify(value)}
                    disabled
                    hidden
                    ref={controlRef}
                />

                <Input
                    autoComplete="off"
                    {...inputProps}
                    innerRef={inputInnerRef}
                    aria-haspopup="true"
                    aria-expanded={menuIsOpen}
                    aria-multiselectable={isMultiple}
                    progress={isLoading}
                    value={inputValue}
                    onChange={onInputChange}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                />

                <Popup
                    view="default"
                    direction={POPUP_DIRECTIONS}
                    target="anchor"
                    anchor={inputInnerRef}
                    visible={menuIsOpen}
                    scope="inplace"
                >
                    <Menu
                        {...menuProps}
                        className={cls('menu')}
                        style={{ maxHeight: '320px', ...menuProps?.style, width: menuWidth }}
                        items={menuItems}
                        value={value}
                        onChange={onMenuChange}
                    />
                </Popup>
            </OutsideClickWrapper>

            {isMultiple && value && (value as unknown as Value[]).length > 0 && (
                <Row gap="xs" wrap="yes" top="xs">
                    {renderTags()}
                </Row>
            )}
        </div>
    );
};
