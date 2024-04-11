import React, { useCallback, useEffect, useRef, useState } from 'react';

import { withBemMod } from '@bem-react/core-fork';
import IMask from 'imask';

import { IInputProps, cnInput } from '../base';

interface InputMaskProps {
    mask?: string;
    maskType?: 'phone';
}

const getInput = (event: React.ChangeEvent<HTMLInputElement>) => event.target;

export const withMask = withBemMod<InputMaskProps, IInputProps>(
    cnInput(),
    { mask: '*' },
    (WrappedComponent) => {
        return ({ mask, maskType, onChange, onInput, ...props }) => {
            if (!mask) {
                return <WrappedComponent {...props} />;
            }

            const imask = IMask.createMask({ mask });

            const onChangeFn = useCallback(
                (event) => {
                    const input = getInput(event);
                    const masked = imask.resolve(input.value);
                    input.value = masked;

                    if (onChange) {
                        onChange(event);
                    }
                },
                [onChange],
            );

            const onInputFn = useCallback(
                (event) => {
                    if (maskType === 'phone') {
                        const input = getInput(event);

                        if (input.value.startsWith('8')) {
                            input.value = input.value.replace('8', '+7');
                        }

                        onChangeFn(event);
                    } else if (onInput) {
                        onInput(event);
                    }
                },
                [onInput],
            );

            return <WrappedComponent {...props} onChange={onChangeFn} onInput={onInputFn} />;
        };
    },
);
