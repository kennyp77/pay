import React from 'react';

import { MapLayout, ModalLayout } from '../components/layout/index@desktop';
import { DrawerLayout, FullscreenLayout } from '../components/layout/index@touch';
import { Contacts } from '../features/contacts';
import { ContactsOb } from '../features/contacts/index-ob';
import { useMapOnContactsPage } from '../hooks/useMapOnContactsPage';

export function ContactsPage({ obRoute, touch }: Checkout.PageProps) {
    const Content = obRoute ? ContactsOb : Contacts;

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
