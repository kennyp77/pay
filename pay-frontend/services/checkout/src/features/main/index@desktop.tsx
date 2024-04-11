import React, { useEffect } from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { Block } from '../../components/block';
import { Box } from '../../components/box';
import { Col } from '../../components/col';
import { Divider } from '../../components/divider';
import { Fullscreen } from '../../components/fullscreen';
import { Row } from '../../components/row';
import { SecureInfoPay } from '../../components/secure';
import { counters } from '../../counters';
import { getShippingType } from '../../store/shipping';
import { hasSplitPlan } from '../../store/split';
import { ShippingType } from '../../typings';

import { MainCart } from './components/cart';
import { MainDeliveryBlock } from './components/delivery';
import { MainHeader } from './components/header/index@desktop';
import { MainPayButton } from './components/pay-button';
import { MainPaymentBlock } from './components/payment';
import { MainPickupBlock } from './components/pickup';
import { SplitPayment } from './components/split-payment/index@desktop';

import './styles@desktop.scss';

export const cnMainDesktopScreen = cn('MainDesktopScreen');

const cnMainDeliveryBlock = cn('MainDeliveryBlock');

const separator = <Divider color="grey" className={cnMainDeliveryBlock('Divider')} />;

const pickupSeparator = (
    <Row bottom="s">
        <Divider color="grey" />
    </Row>
);

export function MainScreenDesktop(): JSX.Element {
    const shippingType = useSelector(getShippingType);
    const hasSplit = useSelector(hasSplitPlan);

    useEffect(() => {
        if (hasSplit) {
            counters.splitAvailable();
        }
    }, [hasSplit]);

    return (
        <Fullscreen bg="grey" className={cnMainDesktopScreen()}>
            <Box all="m">
                <MainHeader />

                <Row top="m" gap="2xl" justify="center">
                    <Col gap="m" className={cnMainDesktopScreen('Delivery')}>
                        <Block bg="white" radius="xl" shadow>
                            {shippingType === ShippingType.Direct && (
                                <MainDeliveryBlock
                                    size="xl"
                                    top="xs"
                                    bottom="xs"
                                    separator={separator}
                                />
                            )}
                            {shippingType === ShippingType.Pickup && (
                                <MainPickupBlock
                                    size="l"
                                    top="m"
                                    bottom="s"
                                    separator={pickupSeparator}
                                />
                            )}
                        </Block>

                        <Block bg="white" radius="xl" shadow>
                            <MainPaymentBlock
                                size="xl"
                                top="2xs"
                                bottom="2xs"
                                separator={separator}
                            />
                        </Block>
                    </Col>

                    <Box className={cnMainDesktopScreen('Pay')}>
                        <Block bg="white" radius="xl" shadow>
                            <Col gap="m" all="xl">
                                <MainPayButton />

                                {hasSplit ? <SplitPayment /> : null}

                                <MainCart height="fixed" />

                                <Divider color="grey" />

                                <SecureInfoPay compact />
                            </Col>
                        </Block>
                    </Box>
                </Row>
            </Box>
        </Fullscreen>
    );
}
