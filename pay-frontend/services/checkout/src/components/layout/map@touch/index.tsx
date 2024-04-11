import React, { ReactNode } from 'react';

import { cn } from '@bem-react/classname';

import { Block } from '../../block';
import { MapLayoutVariant } from '../types';

import './styles.scss';

interface MapLayoutProps {
    top?: ReactNode;
    bottom?: ReactNode;
    variant?: MapLayoutVariant;
}

const cnMapLayout = cn('TouchMapLayout');

export function MapLayout({
    top,
    bottom,
    variant = MapLayoutVariant.TouchShortShort,
}: MapLayoutProps) {
    return (
        <div className={cnMapLayout()}>
            <Block bg="white" className={cnMapLayout('TopBlock', { variant })} shadow>
                {top}
            </Block>
            <Block bg="white" radius="xl" className={cnMapLayout('BottomBlock', { variant })}>
                {bottom}
            </Block>
        </div>
    );
}
