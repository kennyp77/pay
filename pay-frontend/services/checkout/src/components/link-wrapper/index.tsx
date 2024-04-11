import React from 'react';

import { cn } from '@bem-react/classname';
import { Link as RouterDomLink } from 'react-router-dom';
import { useHover } from 'web-platform-alpha';

import './styles.scss';

export interface LinkWrapperProps {
    href: string;
    className?: string;
    children: React.ReactNode;
}

const cnLinkWrapper = cn('LinkWrapper');

export function LinkWrapper({ href, className, children }: LinkWrapperProps) {
    const { hoverProps, isHovered: hovered } = useHover({});

    return (
        <RouterDomLink
            {...hoverProps}
            to={href}
            className={cnLinkWrapper({}, [hovered ? 'hovered' : '', className])}
        >
            {children}
        </RouterDomLink>
    );
}
