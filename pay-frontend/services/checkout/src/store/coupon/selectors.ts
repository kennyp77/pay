import { AsyncStatus } from '@trust/utils/async';
import { createSelector } from 'reselect';

import { OrderItemType } from '../../../../sdk/src/typings';
import { RootState } from '../index';
import { getSheetItems } from '../payment';

const getCoupon = (state: Pick<RootState, 'coupon'>) => state.coupon;

export const getSelectedCoupon = createSelector(getCoupon, (state) => state.selected);

export const isCouponActivated = createSelector(
    getSelectedCoupon,
    getSheetItems,
    (coupon, items) => {
        return Boolean(coupon) || items.some((item) => item.type === OrderItemType.Promocode);
    },
);

export const getCouponValue = createSelector(getCoupon, (state) => state.setCoupon.result);

export const getCouponStatus = createSelector(getCoupon, (state) => state.setCoupon.status);

export const getCouponError = createSelector(getCoupon, (state) => {
    return state.setCoupon.status === AsyncStatus.Error ? state.setCoupon.reason : undefined;
});

export const getRemoveCouponStatus = createSelector(
    getCoupon,
    (state) => state.removeCoupon.status,
);
