import * as React from 'react';
import { memo, useMemo } from 'react';

import { cn } from '@bem-react/classname';
import { asyncData } from '@trust/utils/async';
import { useSelector } from 'react-redux';

import { Box } from '../../components/box';
import { Col } from '../../components/col';
import { Panel, PanelHeader } from '../../components/panel';
import { Row } from '../../components/row';
import { history, Path } from '../../router';
import { getIsSeveralShippingTypes } from '../../store/payment';
import { getPickupPointsStatus } from '../../store/pickup';
import { ShippingType } from '../../typings';
import { ShippingTypeComponent } from '../shipping-type';

import { PickupAddress } from './components/address';
import { PickupLoader } from './components/pickup-loader';
import { PickupContainer } from './pickup-container';

import './pickup.scss';

export interface PickupProps {
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
}

const completeCallbackDefault = () => history.push(Path.Main);

const cnPickup = cn('Pickup');

export const Pickup: React.FC<PickupProps> = memo(function Pickup({
    obHeader,
    completeCallback = completeCallbackDefault,
}: PickupProps) {
    const pickupPointsStatus = useSelector(getPickupPointsStatus);
    const isSeveralShippingTypes = useSelector(getIsSeveralShippingTypes);

    const header = useMemo(() => {
        return obHeader || <PanelHeader title="Доставка" closeHref={Path.Main} />;
    }, [obHeader]);

    return (
        <PickupContainer>
            <Panel
                header={
                    <React.Fragment>
                        {header}
                        {isSeveralShippingTypes && (
                            <Row top="l">
                                <ShippingTypeComponent page={ShippingType.Pickup} />
                            </Row>
                        )}
                    </React.Fragment>
                }
                className={cnPickup()}
            >
                <Col>
                    <Box bottom="l">
                        <PickupAddress />
                    </Box>

                    {asyncData.isNotComplete(pickupPointsStatus) && <PickupLoader />}
                </Col>
            </Panel>
        </PickupContainer>
    );
});
