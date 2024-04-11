import React, { useEffect } from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { Block } from '../../components/block';
import { Box } from '../../components/box';
import { Fullscreen } from '../../components/fullscreen';
import { Panel } from '../../components/panel';
import { SecureInfoPay } from '../../components/secure';
import { counters } from '../../counters';
import { getShippingType } from '../../store/shipping';
import { hasSplitPlan } from '../../store/split';
import { ShippingType } from '../../typings';

import { MainDeliveryBlock } from './components/delivery';
import { MainHeader } from './components/header/index@touch';
import { MainPayButton } from './components/pay-button';
import { MainPaymentBlock } from './components/payment';
import { MainPickupBlock } from './components/pickup';
import { SplitPayment } from './components/split-payment/index@touch';

import './styles@touch.scss';

export const cnMainScreen = cn('MainScreen');

const separator = <Box top="2xs" />;

export function MainScreenTouch(): JSX.Element {
    const shippingType = useSelector(getShippingType);
    const hasSplit = useSelector(hasSplitPlan);

    useEffect(() => {
        if (hasSplit) {
            counters.splitAvailable();
        }
    }, [hasSplit]);

    return (
        <Fullscreen bg="white" className={cnMainScreen()}>
            <Panel
                className={cnMainScreen('Panel')}
                header={<MainHeader />}
                footer={
                    <React.Fragment>
                        <MainPayButton />
                        <Box top="s">
                            <SecureInfoPay />
                        </Box>
                    </React.Fragment>
                }
            >
                <Block bg="white" radius="xl" className={cnMainScreen('Delivery')}>
                    {shippingType === ShippingType.Direct && (
                        <MainDeliveryBlock size="l" top="m" bottom="s" separator={separator} />
                    )}
                    {shippingType === ShippingType.Pickup && (
                        <MainPickupBlock size="l" top="m" bottom="s" separator={separator} />
                    )}
                </Block>
                {hasSplit ? (
                    <React.Fragment>
                        <div className={cnMainScreen('Separator')} />
                        <Block bg="white" radius="xl" className={cnMainScreen('Delivery')}>
                            <SplitPayment />
                        </Block>
                    </React.Fragment>
                ) : null}
                <div className={cnMainScreen('Separator')} />
                <Block bg="white" radius="xl" className={cnMainScreen('Payment')}>
                    <MainPaymentBlock size="l" top="xs" bottom="xs" />
                </Block>
            </Panel>
        </Fullscreen>
    );
}
