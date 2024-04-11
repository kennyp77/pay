import React from 'react';

import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';

import { MapLayout } from '../components/layout/index@desktop';
import { MapLayout as TouchMapLayout } from '../components/layout/index@touch';
import { MapLayoutVariant } from '../components/layout/types';
import { PickupSelectedComponent } from '../features/pickup-selected';
import { PickupSelectedComponentOb } from '../features/pickup-selected/index-ob';
import { PickupHeaderTouch } from '../features/pickup/components/header/index@touch';
import { useMapOnPickupSelectedPage } from '../hooks/useMapOnPickupSelectedPage';
import { Path } from '../router';
import { getPickupSelectedPoint } from '../store/pickup';

export function PickupSelectedPage({ obRoute, touch }: Checkout.PageProps) {
    const Content = obRoute ? PickupSelectedComponentOb : PickupSelectedComponent;
    const selectedPickupPoint = useSelector(getPickupSelectedPoint);

    useMapOnPickupSelectedPage(
        touch
            ? obRoute
                ? MapLayoutVariant.TouchShortHigh
                : MapLayoutVariant.TouchHighHigh
            : MapLayoutVariant.Desktop,
    );

    if (!selectedPickupPoint) {
        return <Redirect to={Path.Pickup} />;
    }

    if (touch) {
        return (
            <TouchMapLayout
                variant={obRoute ? MapLayoutVariant.TouchShortHigh : MapLayoutVariant.TouchHighHigh}
                bottom={<Content />}
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
