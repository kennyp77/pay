/* eslint-disable no-param-reassign */
import {
    PaymentCashback,
    PaymentMethod,
    PaymentMethodKey,
} from '@trust/utils/payment-methods/typings';
import { produce } from 'immer';
import { Action, ReduxCompatibleReducer, handleActions } from 'redux-actions';

import {
    ActionsPayload,
    setPaymentMethodsAction,
    setActivePaymentMethodKeyAction,
    resetActivePaymentMethodKeyAction,
    setCashbackAction,
    setUserCardAction,
} from './actions';
import { UserState } from './state';

export const createReducer = (
    initialState: UserState,
): ReduxCompatibleReducer<UserState, ActionsPayload> =>
    handleActions<UserState, ActionsPayload>(
        {
            [setPaymentMethodsAction.toString()]: produce(
                (draft: UserState, action: Action<PaymentMethod[]>) => {
                    draft.paymentMethods = action.payload;
                },
            ),
            [setActivePaymentMethodKeyAction.toString()]: produce(
                (draft: UserState, action: Action<PaymentMethodKey>) => {
                    draft.activePaymentMethodKey = action.payload;
                },
            ),
            [resetActivePaymentMethodKeyAction.toString()]: produce((draft: UserState) => {
                draft.activePaymentMethodKey = undefined;
            }),
            [setCashbackAction.toString()]: produce(
                (draft: UserState, action: Action<PaymentCashback>) => {
                    draft.cashback = action.payload;
                },
            ),
            [setUserCardAction.toString()]: produce((draft: UserState, action: Action<string>) => {
                draft.savedCard = action.payload;
            }),
        },
        initialState,
    );
