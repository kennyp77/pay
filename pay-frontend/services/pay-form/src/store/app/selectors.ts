import { createSelector } from 'reselect';

import { State } from '..';

import { stateIdentifier } from './state';

export const getState = createSelector(
    (state: State) => state,
    (state) => state[stateIdentifier],
);

export const getScreen = createSelector(getState, (state) => state.screen);

export const getPending = createSelector(getState, (state) => state.pending);

export const getActionError = createSelector(getState, (state) => state.error);

export const getFrameAuthUrl = createSelector(getState, (state) => state.auth3ds?.url);
