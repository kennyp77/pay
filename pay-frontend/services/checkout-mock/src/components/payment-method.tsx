import React, { useContext } from 'react';

import { storeContext } from '../store';
import { UserCard } from '../typings';

import { List, Panel } from './_base';

export function PaymentMethod() {
    const store = useContext(storeContext);

    return (
        <Panel title="Метод оплаты">
            <List<UserCard>
                active={store.data.paymentMethod}
                list={store.data.cards}
                render={[['type'], ['cardNetwork', 'cardLast4']]}
                onSelect={(paymentMethod) => store.set({ paymentMethod })}
            />
        </Panel>
    );
}
