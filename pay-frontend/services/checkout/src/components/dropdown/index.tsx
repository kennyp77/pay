import React, { useRef, useState } from 'react';

import { cn } from '@bem-react/classname';
import {
    Dropdown as DropdownBase,
    DropdownProps as DropdownBaseProps,
} from '@yandex-lego/components/Dropdown/desktop';
import { usePreventScroll } from '@yandex-lego/components/usePreventScroll';

import { Button, ButtonProps } from '../button';

import './styles.scss';

const b = cn('Dropdown');

export interface DropdownProps
    extends Omit<
            DropdownBaseProps,
            | 'visible'
            | 'onVisibleChange'
            | 'trigger'
            | 'mouseEnterDelay'
            | 'mouseLeaveDelay'
            | 'focusDelay'
            | 'blurDelay'
            | 'children'
        >,
        React.HTMLAttributes<HTMLDivElement> {
    buttonSize?: ButtonProps['size'];
}

export const Dropdown = ({ buttonSize = 's', children, ...props }: DropdownProps) => {
    const hostRef = useRef(null);
    const [visible, setVisible] = useState(false);

    usePreventScroll({ enabled: visible });

    return (
        <>
            <div className={b('Overlay', { visible })} />
            <DropdownBase
                ref={hostRef}
                onVisibleChange={setVisible}
                trigger="click"
                view="default"
                hasTail
                {...props}
            >
                <Button
                    view="pseudo"
                    size={buttonSize}
                    checked={visible}
                    pin="circle-circle"
                    className={b('Button')}
                >
                    {children}
                </Button>
            </DropdownBase>
        </>
    );
};
