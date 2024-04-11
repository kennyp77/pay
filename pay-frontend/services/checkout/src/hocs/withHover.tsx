import React from 'react';

import pathOr from '@tinkoff/utils/object/pathOr';
import { useHover, UseHoverProps } from 'web-platform-alpha';

export const withHover =
    <P extends {}>(Component: React.ComponentType<P & UseHoverProps>) =>
    (props: P) => {
        const { hoverProps, isHovered: hovered } = useHover(props);

        return (
            <Component
                {...props}
                {...hoverProps}
                className={`${pathOr(['className'], '', props)} ${hovered ? 'hovered' : ''}`}
            />
        );
    };
