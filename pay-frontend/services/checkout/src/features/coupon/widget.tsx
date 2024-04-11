import React from 'react';

import { useSelector } from 'react-redux';

import { ListButtonWidget } from '../../components/list-button/widget';
import { Path } from '../../router';
import { getSelectedCoupon, isCouponActivated } from '../../store/coupon';

import CouponIcon from './assets/coupon.svg';

const i18n = (v: string) => v;

export const CouponWidget = (): JSX.Element => {
    const couponActivated = useSelector(isCouponActivated);
    const couponValue = useSelector(getSelectedCoupon);

    if (couponActivated) {
        return (
            <ListButtonWidget
                icon={CouponIcon}
                href={Path.CouponSelected}
                title={i18n('Промокод активирован')}
                description={couponValue}
            />
        );
    }

    return <ListButtonWidget icon={CouponIcon} href={Path.Coupon} title={i18n('Промокод')} />;
};
