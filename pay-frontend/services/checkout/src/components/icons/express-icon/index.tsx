import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import ExpressSvg from './assets/express.svg';

import './styles.scss';

const cnExpressIcon = cn('ExpressIcon');

export function ExpressIcon({ className }: IClassNameProps) {
    return (
        <svg className={cnExpressIcon({}, [className])} viewBox={ExpressSvg.viewBox}>
            <use xlinkHref={`#${ExpressSvg.id}`} />
        </svg>
    );
}
