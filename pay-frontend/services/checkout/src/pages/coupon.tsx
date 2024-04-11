import React from 'react';

import { DrawerLayout } from '../components/layout/drawer@touch';
import { ModalLayout } from '../components/layout/modal@desktop';
import { CouponForm } from '../features/coupon';

export function CouponPage({ touch }: Checkout.PageProps) {
    if (touch) {
        return (
            <DrawerLayout>
                <CouponForm />
            </DrawerLayout>
        );
    }

    return (
        <ModalLayout>
            <CouponForm />
        </ModalLayout>
    );
}
