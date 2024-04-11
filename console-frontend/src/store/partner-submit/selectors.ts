import { createSelector } from 'reselect';

import { AppState } from '../root-reducer';

const getSubmitPending = (state: AppState) => state.partnerSubmit.pending;

export const getPartnerSubmit = (state: AppState) =>
  state.partnerSubmit.partner;
const getProviderSubmit = (state: AppState) => state.partnerSubmit.provider;
const getProviderApplication = (state: AppState) =>
  state.partnerSubmit.providerApplication;

const getSubmitError = (state: AppState) => state.partnerSubmit.error;

const getPartnerChecking = (state: AppState) =>
  state.partnerSubmit.partnerBeenChecked;

export const getSubmitPendingSelector = createSelector(
  getSubmitPending,
  (pending) => pending,
);

export const getPartnerSubmitSelector = createSelector(
  getPartnerSubmit,
  (partnerSubmit) => partnerSubmit,
);

export const getProviderSubmitSelector = createSelector(
  getProviderSubmit,
  (providerSubmit) => providerSubmit,
);

export const getSubmitErrorSelector = createSelector(
  getSubmitError,
  (error) => {
    return error;
  },
);

export const getProviderApplicationSelector = createSelector(
  getProviderApplication,
  (providerApplication) => providerApplication,
);

export const getPartnerCheckingSelector = createSelector(
  getPartnerChecking,
  (checking) => checking,
);
