import { createSelector } from 'reselect';

import { AppState } from '../root-reducer';

const getPending = (state: AppState) => state.partnerSuggest.pending;

const getPartnersSuggest = (state: AppState) => state.partnerSuggest.partners;

const getError = (state: AppState) => state.partnerSuggest.error;

export const getPartnersSuggestSelector = createSelector(
  getPartnersSuggest,
  (partners) => partners,
);

export const getPendingSelector = createSelector(
  getPending,
  (pending) => pending,
);

export const getErrorSelector = createSelector(getError, (error) => error);
