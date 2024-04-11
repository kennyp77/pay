import React, { useCallback, useContext } from 'react';

import { ShippingOption } from '@yandex-pay/sdk/src/typings';

import { CheckoutApi } from '../connection';
import { storeContext } from '../store';

import { Panel, List, Progress } from './_base';
import { isEmpty } from './_utils';

const intlDate = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
});
const intlTime = new Intl.DateTimeFormat('ru-RU', { hour: 'numeric', minute: 'numeric' });

const getDT = (item: ShippingOption) => {
    const result = [];

    if (item.date) {
        result.push(intlDate.format(item.date * 1000));
    }

    if (item.time?.from && item.time?.to) {
        result.push(
            [intlTime.format(item.time.from * 1000), intlTime.format(item.time.to * 1000)].join(
                '-',
            ),
        );
    }

    return result.join(' ');
};

export function ShippingOptionsComponent() {
    const store = useContext(storeContext);

    const onSelect = useCallback((shippingOption) => {
        store.set({ shippingOption, orderUpdating: true });

        CheckoutApi.getInstance()
            .shippingOptionChange(shippingOption)
            .then(({ order, errors = store.data.errors }) => {
                store.set({ order, errors, orderUpdating: false });
            });
    }, []);

    if (store.data.shippingUpdating) {
        return (
            <Panel title="Варианты доставки" as="h4">
                <Progress />
            </Panel>
        );
    }

    if (isEmpty(store.data.shippingOptions)) {
        return null;
    }

    return (
        <Panel title="Варианты доставки" as="h4">
            <List<ShippingOption>
                active={store.data.shippingOption}
                list={store.data.shippingOptions}
                render={[['label'], ['amount'], [getDT]]}
                onSelect={onSelect}
            />
        </Panel>
    );
}
