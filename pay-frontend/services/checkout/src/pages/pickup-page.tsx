import React from 'react';

import { MapLayout as TouchMapLayout } from '../components/layout/index@touch';
import { MapLayout } from '../components/layout/map@desktop';
import { MapLayoutVariant } from '../components/layout/types';
import { Pickup } from '../features/pickup';
import { PickupHeaderTouch } from '../features/pickup/components/header/index@touch';
import { PickupOb } from '../features/pickup/pickup-ob';
import { PickupTouch } from '../features/pickup/pickup@touch';
import { useMapOnPickupPage } from '../hooks/useMapOnPickupPage';

export function PickupPage({ touch, obRoute }: Checkout.PageProps) {
    const Content = obRoute ? PickupOb : Pickup;

    useMapOnPickupPage(
        touch
            ? obRoute
                ? MapLayoutVariant.TouchShortShort
                : MapLayoutVariant.TouchHighShort
            : MapLayoutVariant.Desktop,
    );

    if (touch) {
        return (
            <TouchMapLayout
                variant={
                    obRoute ? MapLayoutVariant.TouchShortShort : MapLayoutVariant.TouchHighShort
                }
                bottom={<PickupTouch />}
                top={<PickupHeaderTouch obRoute={obRoute} />}
            />
        );
    }

    return (
        <MapLayout>
            <Content />
        </MapLayout>
    );
}
