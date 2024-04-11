import { createSelector } from 'reselect';

import { RootState } from '..';

const getState = (state: RootState) => state.app;

export const getScreen = createSelector(getState, (state) => state.screen);

export const getUserState = createSelector(getState, (state) => state.userState);

export const getObSteps = createSelector(getState, (state) => state.obSteps);

export const getObCurrentStep = createSelector(getState, (state) => state.obCurrentStep);

export const getPendingScreen = createSelector(getState, (state) => state.pending);

export const getErrorScreen = createSelector(getState, (state) => state.error[0] || undefined);

export const getInitialLoadingStatus = createSelector(getState, (state) => state.initialLoading);

export const getIsOnboardingActive = createSelector(getState, (state) => state.obSteps.active);
