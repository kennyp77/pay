import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { Button, ButtonProps } from '../button';
import { legoButtonIcon } from '../icons';
import { Text } from '../text';

import CloseIcon from './assets/close.svg';

import './styles.scss';

interface TagProps extends IClassNameProps {
    size?: ButtonProps['size'];
    disabled?: boolean;
    onClose?: () => void;
    bg?: 'red';
}

export const cnTag = cn('Tag');

export class Tag extends React.PureComponent<React.PropsWithChildren<TagProps>> {
    render() {
        const { children, className, size, disabled = false, onClose, bg } = this.props;

        const closable = Boolean(onClose);
        const color = bg === 'red' ? 'white' : 'black';

        return (
            <span className={cnTag({ size, disabled, closable, bg }, [className])} aria-disabled={disabled}>
                <Text color={color} variant={size} overflow="ellipsis" className={cnTag('Text')}>
                    {children}
                </Text>
                {closable ? (
                    <Button
                        className={cnTag('Button')}
                        view="clear"
                        size={size}
                        disabled={disabled}
                        onClick={onClose}
                        icon={legoButtonIcon(CloseIcon)}
                    />
                ) : null}
            </span>
        );
    }
}
