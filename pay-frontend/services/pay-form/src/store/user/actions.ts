import {
    PaymentCashback,
    PaymentMethod,
    PaymentMethodKey,
} from '@trust/utils/payment-methods/typings';
import { createAction } from 'redux-actions';

export type ActionsPayload = PaymentMethod[] | PaymentMethodKey | PaymentCashback;

export const setPaymentMethodsAction = createAction<PaymentMethod[]>('SET_PAYMENT_METHODS_ACTION');
export const setActivePaymentMethodKeyAction = createAction<PaymentMethodKey>(
    'SET_ACTIVE_PAYMENT_METHOD_KEY_ACTION',
);
export const resetActivePaymentMethodKeyAction = createAction(
    'RESET_ACTIVE_PAYMENT_METHOD_KEY_ACTION',
);
export const setCashbackAction = createAction<PaymentCashback>('SET_CASHBACK_ACTION');
export const setUserCardAction = createAction<string>('SET_USER_CARD_ACTION');
