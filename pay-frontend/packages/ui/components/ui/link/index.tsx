/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

import { Link } from '@yandex-lego/components/Link/Link';
import { block } from 'bem-cn';

import './styles.css';

const b = block('link');

interface PaymentLinkProps {
    children?: string | JSX.Element;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
    inline?: boolean;
    disabled?: boolean;
    href?: string;
    title?: string;
    theme?: 'normal' | 'grey';
    onClick?: () => void;
}

export default function PaymentLink({
    children,
    href,
    inline,
    leftIcon,
    rightIcon,
    title,
    disabled,
    theme = 'normal',
    onClick,
}: PaymentLinkProps): JSX.Element {
    return (
        <Link
            className={b({ theme, disabled, inline }).toString()}
            title={title}
            disabled={disabled}
            as={href ? 'a' : 'button'}
            onClick={onClick}
        >
            {leftIcon ? <span className={b('icon', { left: true })}>{leftIcon}</span> : null}
            {children ? <span className={b('text')}>{children}</span> : null}
            {rightIcon ? <span className={b('icon', { right: true })}>{rightIcon}</span> : null}
        </Link>
    );
}
