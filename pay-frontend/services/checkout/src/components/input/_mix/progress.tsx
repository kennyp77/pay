import React from 'react';

import { withBemMod } from '@bem-react/core-fork';

import { Spin } from '../../spin';
import { IInputProps, cnInput } from '../base';

import './progress.scss';

interface InputProgressProps {
    progress?: boolean;
}

type MaybeSize = 's' | 'm';

const SPIN_SIZE_MAP = {
    s: 'xxs',
    m: 'xs',
} as const;

export const withProgress = withBemMod<InputProgressProps, IInputProps>(
    cnInput(),
    { progress: '*' },
    (WrappedComponent) => {
        return ({ iconRight, progress, ...props }) => {
            const { size } = props as { size?: MaybeSize };

            const progressIcon = progress ? (
                <span className={cnInput('progressIcon')}>
                    <Spin view="default" size={SPIN_SIZE_MAP[size] || SPIN_SIZE_MAP.m} progress />
                </span>
            ) : undefined;

            return <WrappedComponent {...props} iconRight={progressIcon || iconRight} />;
        };
    },
);
