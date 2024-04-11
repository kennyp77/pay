import React, { useCallback, useRef } from 'react';

import { withBemMod } from '@bem-react/core-fork';

import { MetrikaCounter } from '../../counters/utils';

import { cnInput, IInputProps } from './base';

interface WithAnalyticsProps {
    counter?: MetrikaCounter;
}

export const withAnalytics = withBemMod<WithAnalyticsProps, IInputProps>(
    cnInput(),
    { counter: '*' },
    (WrappedComponent) => {
        return ({ counter, onChange: originalOnChange, ...props }) => {
            const called = useRef<boolean>(false);

            const onChange = useCallback(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                    originalOnChange?.(e);

                    if (!called.current) {
                        counter!();
                        called.current = true;
                    }
                },
                [counter, originalOnChange],
            );

            return <WrappedComponent onChange={counter ? onChange : originalOnChange} {...props} />;
        };
    },
);
