import React from 'react';

import { DrawerLayout } from '../components/layout/drawer@touch';
import { ModalLayout } from '../components/layout/modal@desktop';
import { DirectShipping } from '../features/shipping';

export function DirectShippingPage({ touch }: Checkout.PageProps) {
    if (touch) {
        return (
            <DrawerLayout>
                <DirectShipping />
            </DrawerLayout>
        );
    }

    return (
        <ModalLayout>
            <DirectShipping />
        </ModalLayout>
    );
}
