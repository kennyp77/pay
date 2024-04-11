import { createSelector } from 'reselect';

import { AppState } from '../root-reducer';

const getPending = (state: AppState) => state.partnerData.pending;

export const getPartnerData = (state: AppState) => state.partnerData.data;
const setPartnerData = (state: AppState) => state.partnerData.data;

const getError = (state: AppState) => state.partnerData.error;

export const getPartnerDataSelector = createSelector(
  getPartnerData,
  (partnerData) => partnerData,
);

export const setPartnerDataSelector = createSelector(
  setPartnerData,
  (partnerData) => partnerData,
);

export const getPendingSelector = createSelector(
  getPending,
  (pending) => pending,
);

export const getErrorSelector = createSelector(getError, (error) => error);
