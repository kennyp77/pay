import { useMemo } from 'react';

import { useDispatch } from 'react-redux';

export const useAction = (action: any) => {
    const dispatch = useDispatch();

    return useMemo(
        () =>
            (...restArgs: any[]) =>
                dispatch(action(...restArgs)),
        [dispatch, action],
    );
};
