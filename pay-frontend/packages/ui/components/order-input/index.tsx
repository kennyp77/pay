import React, { useCallback, useEffect, useState, useRef } from 'react';

import { IClassNameProps } from '@bem-react/core';
import { isTouch } from '@trust/utils/helpers/platform';
import { block } from 'bem-cn';

import BigInput from '../ui/big-input';

import './styles.css';

const b = block('order-input');

interface OrderInputProps {
    value?: string;
    errorHint?: string;
    label?: string;
    onChange: (value: string) => void;
    onChangeValidState: (valid: boolean) => void;
    pattern?: RegExp;
}

const IS_TOUCH = isTouch();
const SCROLL_TO_INPUT_DELAY = 500;

export default function OrderInput({
    value,
    onChange,
    onChangeValidState,
    errorHint,
    label,
    pattern,
}: OrderInputProps): JSX.Element {
    const inputRef = useRef<HTMLSpanElement>();
    const [focused, setFocused] = useState(false);
    const [valid, setValid] = useState(true);

    const onBlur = useCallback(() => {
        setFocused(false);
    }, []);
    const onFocus = useCallback(() => {
        setFocused(true);

        /* скролл к элементу, чтобы на маленьких мобилках
       инпут был в поле видимости */
        setTimeout(() => {
            if (IS_TOUCH && inputRef.current) {
                inputRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }, SCROLL_TO_INPUT_DELAY); // ждём пока откроется клавиатура
    }, [inputRef]);

    const onChangeValue = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    }, []);

    useEffect(() => {
        const isValid = value && pattern && pattern.test(value);

        setValid(isValid);
        onChangeValidState(isValid);
    }, [value, pattern, onChangeValidState]);

    return (
        <BigInput
            className={b()}
            innerRef={inputRef}
            value={value}
            onChange={onChangeValue}
            onFocus={onFocus}
            onBlur={onBlur}
            label={label}
            state={focused || valid ? null : 'error'}
            hint={focused || valid ? '' : errorHint}
        />
    );
}
