import React, { useCallback, useContext } from 'react';

import { PickupPoint } from '@yandex-pay/sdk/src/typings';

import { CheckoutApi } from '../connection';
import { storeContext } from '../store';

import { Panel, List, Progress } from './_base';
import { isEmpty, pathOr } from './_utils';

export function PickupPointsComponent() {
    const store = useContext(storeContext);

    const hasPickPoints = !isEmpty(store.data.pickupPoints);
    const hasInitPickPoints = !isEmpty(store.data.initialPickupPoints);

    const boundLabel = pathOr(['data', 'pickupBounds', 'label'], 'Unknown', store);

    const onSelect = useCallback((pickupPoint) => {
        store.set({ pickupPoint, orderUpdating: true });

        CheckoutApi.getInstance()
            .pickupPointChange(pickupPoint)
            .then(({ order, errors = store.data.errors }) => {
                store.set({ order, errors, orderUpdating: false });
            });
    }, []);

    if (store.data.pickupUpdating) {
        return (
            <Panel title="Пункты самовывоза" as="h4">
                <Progress />
            </Panel>
        );
    }

    if (hasInitPickPoints && !hasPickPoints) {
        return (
            <Panel title="Начальные пункты самовывоза" as="h4">
                <List<PickupPoint>
                    active={store.data.pickupPoint}
                    list={store.data.initialPickupPoints}
                    render={[['label'], ['amount']]}
                    onSelect={onSelect}
                />
            </Panel>
        );
    }

    if (!hasPickPoints) {
        return null;
    }

    return (
        <Panel title={`Пункты самовывоза — ${boundLabel}`} as="h4">
            <List<PickupPoint>
                active={store.data.pickupPoint}
                list={store.data.pickupPoints}
                render={[['label'], ['amount']]}
                onSelect={onSelect}
            />
        </Panel>
    );
}
