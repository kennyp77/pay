import { logInfo } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';

import { counters } from '../../counters';
import { pingOpener } from '../../helpers/ping';
import { CheckoutApi } from '../../lib/checkout-api';
import { history, Path } from '../../router';
import { setErrorWithPingOpener } from '../app';
import { updatePaymentInfo } from '../mix';
import { setSheetOrder } from '../payment';
import { RootState } from '../state';

import { setCoupon } from './mutators';

import { setRemoveCoupon } from '.';

const i18n = (s: string) => s;

export const validateCoupon = createService<RootState, [Sdk.Coupon, Sys.CallbackFn0?]>(
    async function validateCoupon({ dispatch }, coupon, next) {
        await dispatch(setCoupon(asyncData.pending()));

        if (coupon.trim().length === 0) {
            await dispatch(setCoupon(asyncData.error(i18n('Поле не может быть пустым'))));

            return;
        }

        try {
            counters.couponTryActivate();

            const { order } = await CheckoutApi.getInstance().couponChange(coupon);

            counters.couponActivated();

            await dispatch(setCoupon(asyncData.success(coupon)));
            await dispatch(setSheetOrder(order));
            await dispatch(updatePaymentInfo());

            if (next) {
                await next();
            }
        } catch (error) {
            if (typeof error === 'string') {
                await dispatch(setCoupon(asyncData.error(error)));

                return;
            }

            pingOpener().finally(() => {
                dispatch(
                    setCoupon(asyncData.error(i18n('Произошла ошибка при проверке промокода'))),
                );
            });
        }
    },
);

export const removeCoupon = createService<RootState, [Sys.CallbackFn0?]>(
    async function removeCoupon({ dispatch }, next) {
        counters.couponTryRemove();

        await dispatch(setRemoveCoupon(asyncData.pending()));

        try {
            const { order } = await CheckoutApi.getInstance().couponReset();

            counters.couponRemove();

            await dispatch(setRemoveCoupon(asyncData.success(undefined)));
            await dispatch(setSheetOrder(order));
            await dispatch(updatePaymentInfo());

            if (next) {
                await next();
            }
        } catch (error) {
            dispatch(
                setErrorWithPingOpener(
                    {
                        reason: 'error_remove_coupon',
                        description: 'Произошла ошибка при удалении промокода',
                        action: () => {
                            logInfo('removeCoupon click again');
                            history.push(Path.CouponSelected);
                        },
                        actionText: 'Повторить',
                    },
                    () => {
                        dispatch(setRemoveCoupon(asyncData.error('error_send')));
                    },
                ),
            );
        }
    },
);
