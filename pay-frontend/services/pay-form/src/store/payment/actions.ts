import { InitPaymentSheet } from '@yandex-pay/sdk/src/typings';
import { createAction } from 'redux-actions';

export type ActionsPayload = InitPaymentSheet | string;

export const setSheetAction = createAction<InitPaymentSheet>('SET_SHEET');

export const changeEmailAction = createAction<string>('CHANGE_EMAIL');

export const changeNameAction = createAction<string>('CHANGE_NAME');
