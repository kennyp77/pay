/* eslint-disable no-param-reassign */
import { PaymentSheet } from '@yandex-pay/sdk/src/typings';
import { produce } from 'immer';
import { Action, ReduxCompatibleReducer, handleActions } from 'redux-actions';

import { ActionsPayload, changeEmailAction, changeNameAction, setSheetAction } from './actions';
import { PaymentState } from './state';

export const createReducer = (
    initialState: PaymentState,
): ReduxCompatibleReducer<PaymentState, ActionsPayload> =>
    handleActions<PaymentState, ActionsPayload>(
        {
            [setSheetAction.toString()]: produce(
                (draft: PaymentState, action: Action<PaymentSheet>) => {
                    draft.sheet = action.payload;
                },
            ),
            [changeEmailAction.toString()]: produce(
                (draft: PaymentState, action: Action<string>) => {
                    draft.email = action.payload;
                },
            ),
            [changeNameAction.toString()]: produce(
                (draft: PaymentState, action: Action<string>) => {
                    draft.name = action.payload;
                },
            ),
        },
        initialState,
    );
