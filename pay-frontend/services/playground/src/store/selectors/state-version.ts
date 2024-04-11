import { createSelector } from 'reselect';

import { State } from 'store/state';

export const getStateVersion = createSelector(
    [(state: State) => state._version],
    (version: number) => version,
);

export const getDynamicCartOption = createSelector(
    [(state: State) => state.options],
    (options) => options.dynamicCart,
);
