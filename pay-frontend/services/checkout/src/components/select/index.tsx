import * as React from 'react';
import { ReactElement, useCallback, useRef, useState } from 'react';

import { cn } from '@bem-react/classname';

import { ListButtonInput } from '../list-button';
import { Menu, MenuChangeEvent, MenuItem } from '../menu';
import { OutsideClickWrapper } from '../outside-click-wrapper';
import { Popup, PopupDirection } from '../popup';

export interface SelectProps<Value> {
    className?: string;

    id?: string;
    name?: string;
    controlRef?: React.RefObject<HTMLSelectElement>;

    selected?: Value;
    content?: React.ReactNode;
    onChange?: Sys.CallbackFn1<Value>;

    menuItems: MenuItem[];
    onMenuOpen?(): void;
    onMenuClose?(): void;
}

const cnSelect = cn('Select');

const POPUP_DIRECTIONS: PopupDirection[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];

export const Select = function <Value>(props: SelectProps<Value>): ReactElement {
    const {
        id,
        name,
        className,
        controlRef,
        selected,
        content,
        onChange,
        //
        menuItems,
    } = props;

    const innerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [menuWidth, setMenuWidth] = useState('auto');

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Escape' || e.code === 'Tab') {
            setMenuIsOpen(false);
        }
    }, []);

    const onMenuChange = useCallback(
        (e: MenuChangeEvent<HTMLElement>) => {
            let nextValue = e.target.value;

            setMenuIsOpen(false);
            onChange?.(nextValue);
        },
        [onChange],
    );

    const onClick = useCallback(() => {
        const width = buttonRef.current?.getBoundingClientRect().width;
        if (width) {
            setMenuWidth(`${width}px`);
        }

        setMenuIsOpen(!menuIsOpen);
    }, [menuIsOpen]);

    const onOutsideClick = useCallback(() => {
        setMenuIsOpen(false);
    }, [setMenuIsOpen]);

    return (
        <div className={cnSelect({}, [className])} ref={innerRef}>
            <OutsideClickWrapper
                targetRef={innerRef}
                visible={menuIsOpen}
                onOutsideClick={onOutsideClick}
            >
                <select
                    id={id}
                    name={name}
                    value={JSON.stringify(selected)}
                    disabled
                    hidden
                    ref={controlRef}
                />

                <div ref={buttonRef}>
                    <ListButtonInput
                        size="s"
                        onKeyDown={onKeyDown}
                        onClick={onClick}
                        active={menuIsOpen}
                    >
                        {content}
                    </ListButtonInput>
                </div>

                <Popup
                    view="default"
                    direction={POPUP_DIRECTIONS}
                    target="anchor"
                    anchor={buttonRef}
                    visible={menuIsOpen}
                    scope="inplace"
                >
                    <Menu
                        className={cnSelect('Menu')}
                        style={{ maxHeight: '240px', width: menuWidth }}
                        items={menuItems}
                        value={selected}
                        onChange={onMenuChange}
                        view="default"
                        size="m"
                    />
                </Popup>
            </OutsideClickWrapper>
        </div>
    );
};
