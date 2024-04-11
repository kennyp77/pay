import isEmpty from '@tinkoff/utils/is/empty';
import { asyncData } from '@trust/utils/async';
import { createSelector } from 'reselect';

import { RootState } from '..';

const DEFAULT_POINTS: Sdk.PickupPoint[] = [];

const getPickupState = (state: RootState) => state.shipping.pickup;

export const getPickupPointsBounds = createSelector(getPickupState, (state) => {
    return state.points.result?.bounds;
});

export const getPickupPointsList = createSelector<
    RootState,
    ReturnType<typeof getPickupState>,
    Sdk.PickupPoint[]
>(getPickupState, (state) => {
    return state.points.result?.list || DEFAULT_POINTS;
});

export const getPickupMapState = createSelector(getPickupState, (state) => state.mapState);

export const getPickupPointsStatus = createSelector(getPickupState, (state) => state.points.status);

export const getPickupSelectedPointId = createSelector<
    RootState,
    ReturnType<typeof getPickupState>,
    Sdk.PickupPointId | null
>(getPickupState, (state) => {
    return state.selectedId;
});

export const getPickupSelectedPoint = createSelector<
    RootState,
    ReturnType<typeof getPickupState>,
    Sdk.PickupPoint | null
>(getPickupState, (state) => {
    return state.selectedPoint;
});

export const isPickupPointHasInfo = createSelector<
    RootState,
    ReturnType<typeof getPickupState>,
    boolean
>(getPickupState, (state) => {
    return !isEmpty(state.selectedPoint?.amount) && !isEmpty(state.selectedPoint?.deliveryDate);
});

export const getIsEmptyPointList = createSelector<
    RootState,
    ReturnType<typeof getPickupState>,
    boolean
>(getPickupState, (state) => {
    return (
        asyncData.isError(state.points.status) ||
        (asyncData.isSuccess(state.points.status) && state.points.result?.list.length === 0)
    );
});

export const getSendPickupPointStatus = createSelector(getPickupState, (state) => {
    return state.sendPickupPoint.status;
});
