import React, { useContext } from 'react';

import { OrderItem, OrderTotal } from '@yandex-pay/sdk/src/typings';

import { storeContext } from '../store';

import { Panel, List, Progress } from './_base';

export function Cart() {
    const store = useContext(storeContext);
    const { sheet } = store.data;

    if (store.data.orderUpdating) {
        return (
            <Panel title="Корзина">
                <Progress />
            </Panel>
        );
    }

    return (
        <Panel title="Корзина">
            <List<OrderItem> list={sheet.order.items} render={[['amount', 'label']]} />
            <List<OrderTotal> list={[sheet.order.total]} render={[['amount', 'label']]} />
        </Panel>
    );
}
