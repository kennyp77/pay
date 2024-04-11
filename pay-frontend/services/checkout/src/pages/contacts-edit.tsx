import React from 'react';

import { MapLayout, ModalLayout } from '../components/layout/index@desktop';
import { DrawerLayout, FullscreenLayout } from '../components/layout/index@touch';
import { ContactsEdit } from '../features/contacts/edit';
import { ContactsEditOb } from '../features/contacts/edit-ob';
import { useMapOnContactsPage } from '../hooks/useMapOnContactsPage';

export function ContactsEditPage({ obRoute, touch, match }: Checkout.PageProps<{ id: string }>) {
    const Content = obRoute ? ContactsEditOb : ContactsEdit;

    useMapOnContactsPage(Boolean(obRoute && !touch));

    if (touch) {
        const Layout = obRoute ? FullscreenLayout : DrawerLayout;

        return (
            <Layout>
                <Content contactId={match.params.id} />
            </Layout>
        );
    }

    const Layout = obRoute ? MapLayout : ModalLayout;

    return (
        <Layout>
            <Content contactId={match.params.id} />
        </Layout>
    );
}
