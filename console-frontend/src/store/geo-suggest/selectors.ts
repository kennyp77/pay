import { createSelector } from 'reselect';

import { AppState } from '../root-reducer';

const getPending = (state: AppState) => state.geoSuggest.pending;

const getGeo = (state: AppState) => state.geoSuggest.geo;

const getError = (state: AppState) => state.geoSuggest.error;

export const getGeoSelector = createSelector(getGeo, (geo) => geo);

export const getPendingSelector = createSelector(
  getPending,
  (pending) => pending,
);

export const getErrorSelector = createSelector(getError, (error) => error);
