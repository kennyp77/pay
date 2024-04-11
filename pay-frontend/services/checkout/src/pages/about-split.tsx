import React from 'react';

import { DrawerLayout } from '../components/layout/drawer@touch';
import { ModalLayout } from '../components/layout/modal@desktop';
import { AboutSplit } from '../features/about-split';

export function AboutSplitPage({ touch }: Checkout.PageProps) {
    if (touch) {
        return (
            <DrawerLayout>
                <AboutSplit />
            </DrawerLayout>
        );
    }

    return (
        <ModalLayout width="auto">
            <AboutSplit width="fixed" />
        </ModalLayout>
    );
}
