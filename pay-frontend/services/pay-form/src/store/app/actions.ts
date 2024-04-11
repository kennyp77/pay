import { createAction } from 'redux-actions';

import { AppScreen, AppPending, AppAuth3ds } from '../../typings';

import { ActionError } from './state';

export type ActionsPayload = AppScreen | AppPending | ActionError | AppAuth3ds;

export const setScreenAction = createAction<AppScreen>('SET_SCREEN');
export const setErrorAction = createAction<ActionError>('SET_ERROR');
export const setPendingAction = createAction<AppPending>('SET_PENDING');
export const resetPendingAction = createAction('RESET_PENDING');
export const setAuth3dsAction = createAction<AppAuth3ds>('SET_AUTH_3DS');
export const resetAuth3dsAction = createAction('RESET_AUTH_3DS');
