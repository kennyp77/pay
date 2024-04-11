import React, { useContext } from 'react';

import { storeContext } from '../store';
import { Contact } from '../typings';

import { List, Panel } from './_base';

export function Contacts() {
    const store = useContext(storeContext);

    return (
        <Panel title="Получатель">
            <List<Contact>
                active={store.data.shippingContact}
                list={store.data.contacts}
                render={[['firstName', 'lastName'], ['email']]}
                onSelect={(shippingContact) => store.set({ shippingContact })}
            />
        </Panel>
    );
}
