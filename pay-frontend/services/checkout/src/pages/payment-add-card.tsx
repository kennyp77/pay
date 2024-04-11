import React from 'react';

import { DrawerLayout } from '../components/layout/drawer@touch';
import { ModalLayout } from '../components/layout/modal@desktop';
import { PaymentNewCard } from '../features/payment-methods/new-card';

export function PaymentAddCardPage({ touch }: Checkout.PageProps): JSX.Element {
    if (touch) {
        return (
            <DrawerLayout>
                <PaymentNewCard />
            </DrawerLayout>
        );
    }

    return (
        <ModalLayout width="auto">
            <PaymentNewCard />
        </ModalLayout>
    );
}
