import React, { Ref, ElementType } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { spacerModsCn, SpacerProps } from '../spacer-mods';

import './styles.scss';

const b = cn('box');

export interface BoxProps extends IClassNameProps, SpacerProps {
    type?: 'inline';
    shrink?: boolean;
    as?: ElementType;
    align?: 'start' | 'center' | 'end';
    innerRef?: Ref<HTMLDivElement>;
}

export class Box extends React.PureComponent<BoxProps & React.HTMLAttributes<HTMLDivElement>> {
    render() {
        const [props, spacerClassName] = spacerModsCn(this.props);
        const {
            as: Component = 'div',
            className,
            children,
            shrink,
            type,
            align,
            innerRef,
            ...restProps
        } = props;

        const mods = { type, shrink, align };
        const classes = b(mods, [className, spacerClassName]);

        return (
            <Component ref={innerRef} className={classes} {...restProps}>
                {children}
            </Component>
        );
    }
}
