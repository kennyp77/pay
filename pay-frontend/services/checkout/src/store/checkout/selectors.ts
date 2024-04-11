import { createSelector } from 'reselect';

import { RootState } from '..';

import { PaymentStageType } from './state';

const getState = (state: RootState) => state.checkout;

export const getPaymentStage = createSelector(getState, (state) => state.stage);

export const isShowSuccessInfo = createSelector(
    getState,
    (state) => state.stage.type === PaymentStageType.SuccessInfo,
);

export const getPaymentOrder = createSelector(getState, (state) => state.order);

export const getPaymentProcessData = createSelector(getState, (state) => state.processData);
