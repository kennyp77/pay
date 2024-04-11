import { Reducer, combineReducers } from 'redux';

import { createReducer as createAppReducer } from './app/reducer';
import { AppState, stateIdentifier as appStateIdentifier, createState as createAppState } from './app/state';
import { createReducer as createPaymentReducer } from './payment/reducer';
import {
    PaymentState,
    stateIdentifier as paymentStateIdentifier,
    createState as createPaymentState,
} from './payment/state';
import { createReducer as createUserReducer } from './user/reducer';
import { UserState, stateIdentifier as userStateIdentifier, createState as createUserState } from './user/state';

export interface State {
    [appStateIdentifier]: AppState;
    [userStateIdentifier]: UserState;
    [paymentStateIdentifier]: PaymentState;
}

export const getState = (): State => ({
    [appStateIdentifier]: createAppState(),
    [userStateIdentifier]: createUserState(),
    [paymentStateIdentifier]: createPaymentState(),
});

export const getReducer = (initialState: Partial<State>): Reducer<State> =>
    combineReducers({
        [appStateIdentifier]: createAppReducer(initialState[appStateIdentifier]),
        [userStateIdentifier]: createUserReducer(initialState[userStateIdentifier]),
        [paymentStateIdentifier]: createPaymentReducer(initialState[paymentStateIdentifier]),
    });
