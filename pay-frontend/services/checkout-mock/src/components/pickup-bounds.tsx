import React, { useContext, useCallback } from 'react';

import { PickupBounds } from '@yandex-pay/sdk/src/typings';

import { CheckoutApi } from '../connection';
import { storeContext } from '../store';

import { Panel, List } from './_base';

type Bounds = { id: number; data: { label: string } & PickupBounds };

const ADDRESS_LIST: Bounds[] = [
    {
        id: 1,
        data: {
            label: 'Москва',
            ne: { latitude: 55.4734677774, longitude: 36.6178951488 },
            sw: { latitude: 55.9803126456, longitude: 38.3757076488 },
        },
    },
    {
        id: 2,
        data: {
            label: 'Cанкт-Петербург',
            ne: { latitude: 59.795899199, longitude: 29.8304455326 },
            sw: { latitude: 60.0214323735, longitude: 30.7093517826 },
        },
    },
];

export function PickupBoundsComponent() {
    const store = useContext(storeContext);

    const onSelect = useCallback(({ data }: Bounds) => {
        const { label, ...bounds } = data;

        store.set({ pickupBounds: data, pickupUpdating: true });

        CheckoutApi.getInstance()
            .pickupBoundsChange(bounds)
            .then(({ pickupPoints, errors = store.data.errors }) => {
                store.set({ pickupPoints, errors, pickupUpdating: false });
            });
    }, []);

    return (
        <Panel title="Область самовывоза" as="h4">
            <List<Bounds>
                active={['data', store.data.pickupBounds]}
                list={ADDRESS_LIST}
                render={[['data.label']]}
                onSelect={onSelect}
            />
        </Panel>
    );
}
