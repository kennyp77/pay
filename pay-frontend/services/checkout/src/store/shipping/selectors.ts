import { createSelector } from 'reselect';

import { RootState } from '..';

const getShippingState = (state: RootState) => state.shipping;
const getState = (state: RootState) => state.directShipping;

export const getShippingOptionsList = createSelector(getState, (state) => state.list.result || []);
export const getShippingOptionsListStatus = createSelector(getState, (state) => state.list.status);
export const isShippingOptionsDisabled = createSelector(getState, (state) => state.disable);

export const findShippingOption = createSelector(
    getShippingOptionsList,
    (list) => (searchId: string) => list.find((item) => item.id === searchId),
);

export const getSelectedShippingOption = createSelector(
    getState,
    findShippingOption,
    (state, findFn) => findFn(state.selectedId),
);

export const getSelectedShippingOptionId = createSelector(
    getSelectedShippingOption,
    (shippingOption) => (shippingOption ? shippingOption.id : ''),
);

export const getShippingType = createSelector(getShippingState, (state) => state.type);

export const getSelectShippingOptionsStatus = createSelector(
    getState,
    (state) => state.selectOption.status,
);
