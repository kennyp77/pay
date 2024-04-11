import React, { useEffect } from 'react';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Toggle } from 'components/toggle';
import { useOption } from 'hooks/use-options';

export function BillingContact() {
    return (
        <Panel caption="Плательщик">
            <PanelOption label="Email">
                <EmailTumbler />
            </PanelOption>

            <PanelOption label="Имя">
                <NameTumbler />
            </PanelOption>
        </Panel>
    );
}

function EmailTumbler() {
    const [receipt] = useOption(['receipt']);
    const [email, setEmail] = useOption(['billingEmail']);

    // Чеки требуют чтобы приходил Email
    useEffect(() => {
        if (receipt) {
            setEmail(true);
        }
    }, [receipt, setEmail]);

    return <Toggle name="email" disabled={receipt} checked={email} onChange={setEmail} />;
}

function NameTumbler() {
    const [name, setName] = useOption(['billingName']);

    return <Toggle name="name" checked={name} onChange={setName} />;
}
