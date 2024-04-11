import React, { useCallback } from 'react';

import { withBemMod } from '@bem-react/core';

import { IInputProps, cnInput } from '../../base';

import { CHARS_AUTOREPLACE, getMaskedValue } from './helpers';

interface InputMaskProps {
    mask?: string | string[];
}

const getInput = (event: React.ChangeEvent<HTMLInputElement>) => event.target;

export const withMask = withBemMod<InputMaskProps, IInputProps>(
    cnInput(),
    { mask: '*' },
    (WrappedComponent) => {
        return ({ mask, onChange, onInput, ...props }) => {
            if (!mask) {
                return <WrappedComponent {...props} onChange={onChange} onInput={onInput} />;
            }

            const onChangeFn = useCallback(
                (event: React.ChangeEvent<HTMLInputElement>) => {
                    const input = getInput(event);
                    const originalValue = input.value;
                    const masked = getMaskedValue(
                        originalValue,
                        Array.isArray(mask) ? mask : [mask],
                    );

                    const caretPosition = input.selectionStart || 0;

                    input.value = masked;

                    let plusPosition = 0;

                    if (
                        originalValue[caretPosition - 1] !== masked[caretPosition - 1] &&
                        CHARS_AUTOREPLACE.includes(masked[caretPosition - 1])
                    ) {
                        plusPosition += 1;
                    }

                    const nextSelection = caretPosition + plusPosition;

                    input.setSelectionRange(nextSelection, nextSelection);

                    if (onChange) {
                        onChange(event);
                    }
                },
                [onChange, mask],
            );

            const onInputFn = useCallback(
                (event) => {
                    if (onInput) {
                        onInput(event);
                    }
                },
                [onInput],
            );

            return <WrappedComponent {...props} onChange={onChangeFn} onInput={onInputFn} />;
        };
    },
);
