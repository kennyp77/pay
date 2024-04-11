import React from 'react';

import { DrawerLayout, FullscreenLayout } from '../components/layout/index@touch';
import { MapLayout } from '../components/layout/map@desktop';
import { AddressesEdit } from '../features/addresses/edit';
import { AddressesEditOb } from '../features/addresses/edit-ob';
import { useMapOnAddressesEditPage } from '../hooks/useMapOnAddressesEditPage';

export function AddressesEditsPage({ obRoute, touch, match }: Checkout.PageProps<{ id: string }>) {
    const Content = obRoute ? AddressesEditOb : AddressesEdit;

    useMapOnAddressesEditPage(match.params.id, !touch);

    if (touch) {
        const Layout = obRoute ? FullscreenLayout : DrawerLayout;

        return (
            <Layout>
                <Content addressId={match.params.id} />
            </Layout>
        );
    }

    return (
        <MapLayout>
            <Content addressId={match.params.id} />
        </MapLayout>
    );
}
