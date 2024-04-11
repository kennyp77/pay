import React from 'react';

import { DrawerLayout } from '../components/layout/drawer@touch';
import { ModalLayout } from '../components/layout/modal@desktop';
import { PaymentMethods } from '../features/payment-methods';

export function PaymentMethodsPage({ touch }: Checkout.PageProps) {
    if (touch) {
        return (
            <DrawerLayout>
                <PaymentMethods />
            </DrawerLayout>
        );
    }

    return (
        <ModalLayout>
            <PaymentMethods />
        </ModalLayout>
    );
}
