import React, { useContext, useCallback } from 'react';

import { CheckoutApi } from '../connection';
import { storeContext } from '../store';
import { Address } from '../typings';

import { Panel, List } from './_base';

export function ShippingAddressComponent() {
    const store = useContext(storeContext);

    const onSelect = useCallback((address) => {
        store.set({ shippingAddress: address, orderRendering: true });

        CheckoutApi.getInstance()
            .shippingAddressChange(address)
            .then(({ shippingOptions, errors = store.data.errors }) => {
                store.set({ shippingOptions, errors, orderRendering: false });
            });
    }, []);

    return (
        <Panel title="Адрес доставки" as="h4">
            <List<Address>
                active={store.data.shippingAddress}
                list={store.data.addresses}
                render={[
                    ['country', 'locality'],
                    ['street', 'building', 'room'],
                ]}
                onSelect={onSelect}
            />
        </Panel>
    );
}
