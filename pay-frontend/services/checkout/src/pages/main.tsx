import React from 'react';

import { MainScreenDesktop } from '../features/main/index@desktop';
import { MainScreenTouch } from '../features/main/index@touch';

export function MainPage({ touch }: Checkout.PageProps) {
    if (touch) {
        return <MainScreenTouch />;
    }

    return <MainScreenDesktop />;
}
