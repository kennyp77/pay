import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { spacerModsCn, SpacerProps } from '../spacer-mods';

import './styles.scss';

const b = cn('Block');

type BlockRadius = '3xl' | '2xl' | 'xl' | 'l' | 'm' | 's' | 'xs' | '2xs' | '3xs';

type BlockBackground = 'white' | 'grey' | 'red' | 'red-light' | 'green-light';
type BlockShadow = boolean;

export interface BlockProps extends IClassNameProps, SpacerProps {
    bg?: BlockBackground;
    radius?: BlockRadius;
    shadow?: BlockShadow;
    overflow?: 'visible' | 'hidden';
}

export class Block extends React.PureComponent<BlockProps & React.HTMLAttributes<HTMLDivElement>> {
    render() {
        const [props, spacerClassName] = spacerModsCn(this.props);
        const {
            className,
            children,
            bg,
            radius,
            shadow,
            overflow = 'hidden',
            ...restProps
        } = props;

        const classes = b({ bg, radius, shadow, overflow }, [className, spacerClassName]);

        return (
            <div className={classes} {...restProps}>
                {children}
            </div>
        );
    }
}
