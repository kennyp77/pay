/* eslint-disable no-param-reassign */
import { produce } from 'immer';
import { Action, ReduxCompatibleReducer, handleActions } from 'redux-actions';

import { AppScreen, AppPending, AppAuth3ds } from '../../typings';

import {
    ActionsPayload,
    setScreenAction,
    setPendingAction,
    resetPendingAction,
    setErrorAction,
    setAuth3dsAction,
    resetAuth3dsAction,
} from './actions';
import { ActionError, AppState } from './state';

export const createReducer = (
    initialState: AppState,
): ReduxCompatibleReducer<AppState, ActionsPayload> =>
    handleActions<AppState, ActionsPayload>(
        {
            [setScreenAction.toString()]: produce((draft: AppState, action: Action<AppScreen>) => {
                draft.screen = action.payload;
            }),
            [setErrorAction.toString()]: produce((draft: AppState, action: Action<ActionError>) => {
                draft.error = action.payload;
            }),
            [setPendingAction.toString()]: produce(
                (draft: AppState, action: Action<AppPending>) => {
                    draft.pending = action.payload;
                },
            ),
            [resetPendingAction.toString()]: produce(
                (draft: AppState, action: Action<AppPending>) => {
                    if (!action.payload || draft.pending === action.payload) {
                        draft.pending = null;
                    }
                },
            ),
            [setAuth3dsAction.toString()]: produce(
                (draft: AppState, action: Action<AppAuth3ds>) => {
                    draft.auth3ds = action.payload;
                },
            ),
            [resetAuth3dsAction.toString()]: produce((draft: AppState) => {
                draft.auth3ds = null;
            }),
        },
        initialState,
    );
