import pathOr from '@tinkoff/utils/object/pathOr';
import { asyncData } from '@trust/utils/async';
import { createSelector } from 'reselect';

import { RootState } from '..';
import { CASH_KEY } from '../../helpers/payment-method';
import { getActivePaymentId } from '../payment-methods';

const getState = (state: RootState) => state.split;

export const hasSplitPlan = createSelector(getState, (state) => {
    return pathOr(['splitPlan', 'result', 'payments'], [], state).length > 0;
});

export const getSplitPlan = createSelector(getState, (state) => {
    return state.splitPlan.result || null;
});

export const getSplitFirstPayAmount = createSelector(getState, (state) => {
    return pathOr(['splitPlan', 'result', 'payments', 0, 'amount'], null, state);
});

export const getSplitRemainedAmount = createSelector(getSplitPlan, (plan) => {
    if (!plan) {
        return null;
    }

    const sum = plan.payments.reduce((sum, payment, index) => {
        if (index === 0) {
            return sum;
        }

        return sum + Number(payment.amount);
    }, 0);

    return String(sum);
});

export const getSplitNextPaymentDate = createSelector(getSplitPlan, (plan) => {
    if (!plan) {
        return null;
    }

    // NB: После перевода на новое API Сплита, оставить только поиск 'expected' статуса
    const nextPayment =
        plan.payments.find((payment) => payment.status === 'expected') ||
        plan.payments.find((payment) => payment.status === 'coming');

    if (nextPayment) {
        return nextPayment.datetime;
    }

    return null;
});

export const isSplitAvailable = createSelector(getState, (state) => state.isAvailable);

export const isSplitDisabled = createSelector(getActivePaymentId, (activePaymentId) => {
    return activePaymentId === CASH_KEY;
});

export const isPayWithSplit = createSelector(
    getState,
    isSplitAvailable,
    isSplitDisabled,
    (state, isAvailable, isDisabled) => {
        return isAvailable && !isDisabled && state.payWithSplit;
    },
);

export const isSplitPaymentSuccess = createSelector(getState, (state) => {
    return state.splitPayment?.isSuccess || false;
});
