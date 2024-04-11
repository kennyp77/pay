import React from 'react';

import { DrawerLayout } from '../components/layout/drawer@touch';
import { ModalLayout } from '../components/layout/modal@desktop';
import { SplitAboutPlus } from '../features/about-split-plus';

export function AboutSplitPlusPage({ touch }: Checkout.PageProps) {
    if (touch) {
        return (
            <DrawerLayout>
                <SplitAboutPlus />
            </DrawerLayout>
        );
    }

    return (
        <ModalLayout>
            <SplitAboutPlus />
        </ModalLayout>
    );
}
