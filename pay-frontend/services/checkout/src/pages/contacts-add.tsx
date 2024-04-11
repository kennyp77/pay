import React from 'react';

import { MapLayout, ModalLayout } from '../components/layout/index@desktop';
import { DrawerLayout, FullscreenLayout } from '../components/layout/index@touch';
import { ContactsAdd } from '../features/contacts/add';
import { ContactsAddOb } from '../features/contacts/add-ob';
import { useMapOnContactsPage } from '../hooks/useMapOnContactsPage';

export function ContactsAddPage({ obRoute, touch }: Checkout.PageProps) {
    const Content = obRoute ? ContactsAddOb : ContactsAdd;

    useMapOnContactsPage(Boolean(obRoute && !touch));

    if (touch) {
        const Layout = obRoute ? FullscreenLayout : DrawerLayout;

        return (
            <Layout>
                <Content />
            </Layout>
        );
    }

    const Layout = obRoute ? MapLayout : ModalLayout;

    return (
        <Layout>
            <Content />
        </Layout>
    );
}
