import React from 'react';

import { cn } from '@bem-react/classname';

import './styles.scss';

const cnLink = cn('Link');

interface LinkProps {
    href: string;
    children?: string | JSX.Element;
    className?: string;
}

export function Link({ href, children, className }: LinkProps): JSX.Element {
    return (
        <a
            href={href}
            className={cnLink({}, [className])}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </a>
    );
}
