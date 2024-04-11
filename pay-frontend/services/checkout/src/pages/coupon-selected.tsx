import React from 'react';

import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';

import { DrawerLayout } from '../components/layout/drawer@touch';
import { ModalLayout } from '../components/layout/modal@desktop';
import { CouponView } from '../features/coupon/view';
import { Path } from '../router';
import { getSelectedCoupon, isCouponActivated } from '../store/coupon';

export function CouponSelectedPage({ touch }: Checkout.PageProps) {
    const couponActivated = useSelector(isCouponActivated);

    if (!couponActivated) {
        return <Redirect to={Path.Main} />;
    }

    if (touch) {
        return (
            <DrawerLayout>
                <CouponView />
            </DrawerLayout>
        );
    }

    return (
        <ModalLayout>
            <CouponView />
        </ModalLayout>
    );
}
