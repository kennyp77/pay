import { createSelector } from 'reselect';

import { AppState } from '../root-reducer';

export const getApiKeys = (state: AppState) => state.developers.apiKeys;

export const getApiKeysSelector = createSelector(
  getApiKeys,
  (apiKeys) => apiKeys,
);

export const getNewApiKey = (state: AppState) => state.developers.newApiKey;

export const getNewApiKeySelector = createSelector(
  getNewApiKey,
  (newApiKey) => newApiKey,
);

export const getApiKeyError = (state: AppState) => state.developers.error;

export const getApiKeyErrorSelector = createSelector(
  getApiKeyError,
  (error) => error,
);
