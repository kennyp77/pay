import React from 'react';

import { withBemMod } from '@bem-react/core-fork';

import { DividerProps, cnDivider } from '../base';

import './styles.scss';

type DividerColor = 'black' | 'grey' | 'white';

interface DividerWithColorProps {
    color?: DividerColor;
}

export const withColor = withBemMod<DividerWithColorProps, DividerProps>(
    cnDivider(),
    { color: '*' },
    (WrappedComponent) => {
        return ({ color = 'grey', className, ...props }) => {
            return <WrappedComponent {...props} className={cnDivider({ color }, [className])} />;
        };
    },
);
