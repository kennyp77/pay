import React, { useCallback, useEffect, useState } from 'react';

import { IClassNameProps } from '@bem-react/core';

import { Input } from '../input';

interface InputFormProps extends IClassNameProps {
    label?: string;
    value?: string;
    patterns?: RegExp[];
    errorMessage?: string;
    required?: boolean;
    mask?: string | string[];
    placeholder?: string;
    disabled?: boolean;

    onChange?: (value: string) => void;
}

export function InputForm({
    label,
    value,
    patterns,
    errorMessage = 'Ошибка',
    className,
    required = false,
    mask,
    placeholder,
    disabled,
    onChange,
}: InputFormProps): JSX.Element {
    const [inputValue, setInputValue] = useState(value);
    const [error, setError] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);

    const onChangeValue = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const _value = e.target.value;
            let _error: string | null = null;

            setInputValue(_value);

            if (required && !_value) {
                _error = 'Поле должно быть заполнено';
            } else if (patterns) {
                const isValid = _value ? patterns.some((pattern) => pattern.test(_value)) : true;

                _error = isValid ? null : errorMessage;
            }

            setError(_error);
            onChange(_error ? '' : _value);
        },
        [required, errorMessage, patterns, onChange],
    );

    return (
        <Input
            className={className}
            size="m"
            view="material"
            variant="filled"
            mask={mask}
            label={label}
            placeholder={placeholder}
            value={inputValue}
            hint={focused ? null : error}
            state={error && !focused ? 'error' : null}
            disabled={disabled}
            onChange={onChangeValue}
            onBlur={() => setFocused(false)}
            onFocus={() => setFocused(true)}
        />
    );
}
