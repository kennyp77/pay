import React from 'react';

import { DrawerLayout, FullscreenLayout } from '../components/layout/index@touch';
import { MapLayout } from '../components/layout/map@desktop';
import { AddressesAdd } from '../features/addresses/add';
import { AddressesAddOb } from '../features/addresses/add-ob';
import { useMapOnAddressesAddPage } from '../hooks/useMapOnAddressesAddPage';

export function AddressesAddPage({ obRoute, touch }: Checkout.PageProps) {
    const Content = obRoute ? AddressesAddOb : AddressesAdd;

    useMapOnAddressesAddPage(!touch);

    if (touch) {
        const Layout = obRoute ? FullscreenLayout : DrawerLayout;

        return (
            <Layout>
                <Content />
            </Layout>
        );
    }

    return (
        <MapLayout>
            <Content />
        </MapLayout>
    );
}
