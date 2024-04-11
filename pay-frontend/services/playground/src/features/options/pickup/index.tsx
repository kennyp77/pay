import * as React from 'react';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Select } from 'components/select';
import { Toggle } from 'components/toggle';
import { useOption, useAvailableOptions } from 'hooks/use-options';

interface PickupProps {
    setup?: boolean;
}

export function Pickup(props: PickupProps) {
    return (
        <Panel caption="Адрес самовывоза">
            <PanelOption label="Есть самовывоз">
                <PickupTumbler />
            </PanelOption>

            {props.setup ? (
                <PanelOption label="Есть ответ на Setup">
                    <SetupOptionsTumbler />
                </PanelOption>
            ) : null}

            <PanelOption label="Ответ на Change">
                <ChangeAnswerSelector />
            </PanelOption>
        </Panel>
    );
}

function PickupTumbler() {
    const [pickup, setPickup] = useOption(['pickup']);

    return <Toggle name="pickup" checked={pickup} onChange={setPickup} />;
}

function SetupOptionsTumbler() {
    const [pickupSetup, setPickupSetup] = useOption(['pickupSetup']);

    return <Toggle name="pickupSetup" checked={pickupSetup} onChange={setPickupSetup} />;
}

function ChangeAnswerSelector() {
    const [pickupAnswer, setPickupAnswer] = useOption(['pickupAnswer']);
    const pickupOptions = useAvailableOptions(['pickupOptions']);

    return (
        <Select
            name="pickupAnswer"
            options={pickupOptions}
            value={pickupAnswer}
            onChange={setPickupAnswer}
        />
    );
}
