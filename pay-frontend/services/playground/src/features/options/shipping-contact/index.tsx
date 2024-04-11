import * as React from 'react';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Select } from 'components/select';
import { useOption, useAvailableOptions } from 'hooks/use-options';

export function ShippingContact() {
    return (
        <Panel caption="Получатель">
            <PanelOption label="Получатель">
                <ContactSelector />
            </PanelOption>
        </Panel>
    );
}

function ContactSelector() {
    const [contactItems, setContactItems] = useOption(['shippingContact']);
    const shippingContactOptions = useAvailableOptions(['shippingContactOptions']);

    return (
        <Select
            name="contactItems"
            options={shippingContactOptions}
            value={contactItems}
            onChange={setContactItems}
        />
    );
}
