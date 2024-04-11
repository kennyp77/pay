import * as React from 'react';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Select } from 'components/select';
import { Toggle } from 'components/toggle';
import { useOption, useAvailableOptions } from 'hooks/use-options';

export function Shipping() {
    return (
        <Panel caption="Адрес доставки">
            <PanelOption label="Есть доставка">
                <ShippingTumbler />
            </PanelOption>

            <PanelOption label="Ответ 1">
                <AnswerSelector idx="0" />
            </PanelOption>

            <PanelOption label="Ответ 2">
                <AnswerSelector idx="1" />
            </PanelOption>
        </Panel>
    );
}

function ShippingTumbler() {
    const [shipping, setShipping] = useOption(['shipping']);

    return <Toggle name="shipping" checked={shipping} onChange={setShipping} />;
}

function AnswerSelector({ idx }: { idx: '0' | '1' }) {
    const [shippingAnswer, setShippingAnswer] = useOption(['shippingAnswer', idx]);
    const shippingOptions = useAvailableOptions(['shippingOptions']);

    return (
        <Select
            name={`shippingAnswer${idx}`}
            options={shippingOptions}
            value={shippingAnswer}
            onChange={setShippingAnswer}
        />
    );
}
