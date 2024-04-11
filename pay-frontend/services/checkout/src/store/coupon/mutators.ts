import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '../index';

export const setCoupon = createService<RootState, [Async.Data<Sdk.Coupon>]>(function setCoupon(
    { produce },
    data,
) {
    produce((draft) => {
        draft.coupon.setCoupon = data;
        // При сохранении купона, важно ресетнуть статус удаления
        draft.coupon.removeCoupon = asyncData.initial();

        if (asyncData.isSuccess(data.status)) {
            draft.coupon.selected = data.result;
        }
    });
});

export const resetCouponData = createService<RootState>(function resetCouponData({ dispatch }) {
    dispatch(setCoupon(asyncData.initial()));
});

export const resetCoupon = createService<RootState>(function resetCoupon({ dispatch, produce }) {
    dispatch(resetCouponData());
    produce((draft) => {
        draft.coupon.selected = '';
    });
});

export const setRemoveCoupon = createService<RootState, [Async.Data<void>]>(
    function setRemoveCoupon({ produce }, data) {
        produce((draft) => {
            draft.coupon.removeCoupon = data;
            // При удалении купона, важно ресетнуть статус сохранения
            draft.coupon.setCoupon = asyncData.initial();

            if (asyncData.isSuccess(data.status)) {
                draft.coupon.selected = '';
            }
        });
    },
);
