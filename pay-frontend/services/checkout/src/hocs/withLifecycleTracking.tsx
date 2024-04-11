import React, { memo } from 'react';

import { useEffectOnce } from 'react-use';

interface WithLifecycleTrackingProps {
    onEnter?: Sys.CallbackFn0;
    onLeave?: Sys.CallbackFn0;
}

export const withLifecycleTracking = <P extends {}>(
    Component: React.ComponentType<P>,
    { onEnter, onLeave }: WithLifecycleTrackingProps = {},
) =>
    memo((props: P) => {
        useEffectOnce(() => {
            if (onEnter) {
                onEnter();
            }

            return () => {
                if (onLeave) {
                    onLeave();
                }
            };
        });

        // @ts-ignore
        return <Component {...props} />;
    });
