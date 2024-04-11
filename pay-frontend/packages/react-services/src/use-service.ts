import { useMemo } from 'react';

import { useStore } from 'react-redux';

import { ServiceFn } from './typings';

export function useService<StateSchema, Input extends any[]>(
    serviceFn: ServiceFn<StateSchema, Input>,
): ServiceFn<StateSchema, Input> {
    const store = useStore();

    return useMemo(
        () =>
            (...data) =>
                store.dispatch(serviceFn(...data)),
        [serviceFn, store],
    );
}
