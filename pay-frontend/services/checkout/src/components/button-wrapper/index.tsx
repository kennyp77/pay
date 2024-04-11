import React, { DOMAttributes, Ref, useRef, FC } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { useForkRef, useButton, UseButtonProps } from 'web-platform-alpha';

import { ButtonProps } from '../button';

import './styles.scss';

export interface ButtonWrapperProps
    extends DOMAttributes<HTMLElement>,
        IClassNameProps,
        UseButtonProps {
    /**
     * Ссылка на DOM-элемент кнопки.
     */
    buttonRef?: Ref<HTMLElement>;
    width?: ButtonProps['width'];
}

export const cnButtonWrapper = cn('ButtonWrapper');

export const ButtonWrapper: FC<ButtonWrapperProps> = ({
    className,
    buttonRef: externalRef,
    width,
    ...props
}) => {
    const internalRef = useRef<HTMLElement>(null);

    const { ElementType, buttonProps, isPressed: pressed } = useButton(props, internalRef);
    const buttonRef = useForkRef(externalRef, internalRef);

    const { disabled } = props;

    // TODO: убрать, если в лего перестанут передавать в компонент пропс onPress, реакт ругается
    const { onPress, ...normalButtonProps } = buttonProps as React.HTMLAttributes<HTMLElement> & {
        onPress: any;
    };

    return (
        <ElementType
            {...normalButtonProps}
            className={cnButtonWrapper({ pressed, disabled, width }, [className])}
            ref={buttonRef}
        />
    );
};
