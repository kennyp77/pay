import { createSelector } from 'reselect';

import { RootState } from '../state';

export const getMapState = (state: Pick<RootState, 'map'>) => state.map;

export const getMapSdk = createSelector(getMapState, (state) => state.sdk);
export const getMapSdkStatus = createSelector(getMapSdk, (sdk) => sdk.status);

export const getMapInactive = createSelector(getMapState, (state) => state.inactive);
export const getMapVisible = createSelector(getMapState, (state) => state.visible);

export const getMapCenter = createSelector(getMapState, (state) => state.center);
export const getMapZoom = createSelector(getMapState, (state) => state.zoom);
export const getMapBounds = createSelector(getMapState, (state) => state.bounds);
export const getMapMargin = createSelector(getMapState, (state) => state.margin);
export const getMapBehaviors = createSelector(getMapState, (state) => state.behaviors);

export const getMapPlacemarks = createSelector(getMapState, (state) => state.placemarks);
