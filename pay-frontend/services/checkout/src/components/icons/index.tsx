import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import isString from '@tinkoff/utils/is/string';

import './styles.scss';

export const cnIcon = cn('Icon');

export type SvgIcon =
    | string
    | {
          id: string;
          viewBox: string;
      };

export type IconSize = 'xs' | 's' | 'm' | 'l';

export interface IconProps extends IClassNameProps {
    svg: SvgIcon;
    size?: IconSize;
}

export const legoButtonIcon = (svg: SvgIcon) => (className?: any) => {
    return (
        <span className={className}>
            {isString(svg) ? (
                <img src={svg} alt="" />
            ) : (
                <svg viewBox={svg.viewBox}>
                    <use xlinkHref={`#${svg.id}`} />
                </svg>
            )}
        </span>
    );
};

export const Icon: React.FC<IconProps> = ({ svg, className, size }: IconProps) => {
    if (!svg) {
        return null;
    }

    return (
        <span className={cnIcon({ size }, [className])}>
            {isString(svg) ? (
                <img src={svg} alt="" />
            ) : (
                <svg viewBox={svg.viewBox}>
                    <use xlinkHref={`#${svg.id}`} />
                </svg>
            )}
        </span>
    );
};
