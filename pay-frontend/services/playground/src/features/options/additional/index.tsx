import * as React from 'react';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Toggle } from 'components/toggle';
import { useOption } from 'hooks/use-options';

function Tele2GiftBadgeToggle() {
    const [tele2GiftBadge, setTele2GiftBadge] = useOption(['t2Badge']);

    return <Toggle name="tele2-gift-badge" checked={tele2GiftBadge} onChange={setTele2GiftBadge} />;
}

export function Additional() {
    return (
        <Panel caption="Дополнительно">
            <PanelOption label="Tele2 gift badge">
                <Tele2GiftBadgeToggle />
            </PanelOption>
        </Panel>
    );
}
