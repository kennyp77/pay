import React, { useContext } from 'react';

import { ShippingType } from '@yandex-pay/sdk/src/typings';

import { storeContext } from '../store';

import { List, Panel } from './_base';
import { requiredFields } from './_utils';
import { PickupBoundsComponent } from './pickup-bounds';
import { PickupPointsComponent } from './pickup-points';
import { ShippingAddressComponent } from './shipping-address';
import { ShippingOptionsComponent } from './shipping-options';

type TypeList = {
    id: ShippingType;
    title: string;
};

export function Shipping() {
    const store = useContext(storeContext);

    const required = requiredFields(store.data.sheet);

    const shippingTypesList: TypeList[] = [
        required.shippingDirect && {
            id: ShippingType.Direct,
            title: 'Курьером',
        },
        // required.shippingPickup && {
        //     id: ShippingType.Pickup,
        //     title: 'Самовывоз',
        // },
    ].filter(Boolean);

    return (
        <Panel title="Доставка">
            <List<TypeList>
                active={['id', store.data.shippingType]}
                list={shippingTypesList}
                render={[['title']]}
                onSelect={({ id }) => store.set({ shippingType: id })}
            />

            {store.data.shippingType === ShippingType.Direct ? (
                <div>
                    <ShippingAddressComponent />
                    <ShippingOptionsComponent />
                </div>
            ) : null}
            {store.data.shippingType === ShippingType.Pickup ? (
                <div>
                    <PickupBoundsComponent />
                    <PickupPointsComponent />
                </div>
            ) : null}
        </Panel>
    );
}
