import React from 'react';

import { FullscreenLayout } from '../components/layout/index@touch';
import { MapLayout } from '../components/layout/map@desktop';
import { Addresses } from '../features/addresses';
import { AddressesOb } from '../features/addresses/index-ob';
import { useMapOnAddressesPage } from '../hooks/useMapOnAddressesPage';

export function AddressesPage({ obRoute, touch }: Checkout.PageProps) {
    const Content = obRoute ? AddressesOb : Addresses;

    useMapOnAddressesPage(!touch);

    if (touch) {
        return (
            <FullscreenLayout fixed>
                <Content />
            </FullscreenLayout>
        );
    }

    return (
        <MapLayout>
            <Content />
        </MapLayout>
    );
}
