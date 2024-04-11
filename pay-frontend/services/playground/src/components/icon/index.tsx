import React, { useMemo } from 'react';

import * as assets from './assets';

export type IconsKey = keyof typeof assets;

const icons: Record<IconsKey, any> = assets;

export type IconProps = {
    type: IconsKey;
    height?: number;
    width?: number;
};

export const Icon: React.FC<IconProps & React.HTMLAttributes<SVGElement>> = (props) => {
    const { type, height = 16, width = 16, ...rest } = props;

    const icon = useMemo(() => icons[type], [type]);

    return (
        <svg viewBox={icon.viewBox} width={width} height={height} {...rest}>
            <use xlinkHref={`#${icon.id}`} />
        </svg>
    );
};
