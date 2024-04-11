import React from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { Panel, PanelHeader } from '../../../../components/panel';
import { Path } from '../../../../router';
import { getIsSeveralShippingTypes } from '../../../../store/payment';
import { ShippingType } from '../../../../typings';
import { ShippingTypeComponent } from '../../../shipping-type';

import './styles@touch.scss';

const i18n = (v: string) => v;

const cnPickupHeaderTouch = cn('PickupHeaderTouch');

export function PickupHeaderTouch({ obRoute }: Pick<Checkout.PageProps, 'obRoute'>) {
    const isSeveralShippingTypes = useSelector(getIsSeveralShippingTypes);

    return (
        <Panel
            className={cnPickupHeaderTouch({ ob: obRoute })}
            header={
                <React.Fragment>
                    {!obRoute && <PanelHeader closeHref={Path.Main} title={i18n('Доставка')} />}

                    {isSeveralShippingTypes && <ShippingTypeComponent page={ShippingType.Pickup} />}
                </React.Fragment>
            }
        />
    );
}
