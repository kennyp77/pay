import React, { useCallback, useEffect, useMemo } from 'react';

import { cn } from '@bem-react/classname';
import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Amount } from '../../components/amount';
import { Button } from '../../components/button';
import { Col } from '../../components/col';
import { Panel, PanelHeader } from '../../components/panel';
import { Text } from '../../components/text';
import { isFree } from '../../helpers/amount';
import { history, Path } from '../../router';
import { getCurrencyCode } from '../../store/payment';
import {
    getPickupSelectedPoint,
    getSendPickupPointStatus,
    isPickupPointHasInfo,
    requestPickupInfo,
    sendPickupPoint,
} from '../../store/pickup';
import { PickupLoader } from '../pickup/components/pickup-loader';

import { PickupInfo } from './components/pickup-info';

import './styles.scss';

interface PickupSelectedProps {
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
}

const completeCallbackDefault = () => history.push(Path.Main);

const cnPickupSelectedComponent = cn('PickupSelectedComponent');

const i18n = (v: string) => v;

export function PickupSelectedComponent({
    obHeader,
    completeCallback = completeCallbackDefault,
}: PickupSelectedProps) {
    const pickupInfoLoaded = useSelector(isPickupPointHasInfo);
    const pickupPoint = useSelector(getPickupSelectedPoint) as Sdk.PickupPoint;
    const currencyCode = useSelector(getCurrencyCode);
    const sendStatus = useSelector(getSendPickupPointStatus);
    const sendPickupPointFn = useService(sendPickupPoint);
    const requestPickupInfoFn = useService(requestPickupInfo);

    const onClick = useCallback(() => {
        sendPickupPointFn(completeCallback);
    }, [sendPickupPointFn, completeCallback]);

    useEffect(() => {
        requestPickupInfoFn(pickupPoint);
    }, [requestPickupInfoFn, pickupPoint]);

    const amount = useMemo(() => {
        if (pickupPoint.amount) {
            return isFree(pickupPoint.amount) ? (
                i18n('бесплатно')
            ) : (
                <Amount amount={pickupPoint.amount} currency={currencyCode} />
            );
        }

        return null;
    }, [pickupPoint, currencyCode]);

    return (
        <Panel
            header={
                <PanelHeader
                    title={
                        pickupInfoLoaded ? (
                            <Text variant="header-m">
                                {i18n('Самовывоз.')} {pickupPoint.address},{' '}
                                <span className={cnPickupSelectedComponent('Amount')}>
                                    {amount}
                                </span>
                            </Text>
                        ) : (
                            <Text variant="header-m">
                                {i18n('Самовывоз.')} {pickupPoint.address}
                            </Text>
                        )
                    }
                    closeHref={Path.Pickup}
                />
            }
            footer={
                pickupInfoLoaded ? (
                    <Button
                        size="l"
                        view="action"
                        variant="primary"
                        width="max"
                        pin="round-m"
                        progress={asyncData.isPending(sendStatus)}
                        onClick={onClick}
                    >
                        {`${i18n('Заберу отсюда')} — `}
                        {amount}
                    </Button>
                ) : null
            }
            className={cnPickupSelectedComponent()}
        >
            {pickupInfoLoaded ? (
                <React.Fragment>
                    <PickupInfo pickupPoint={pickupPoint} />

                    {/* Свободное описание */}
                    {pickupPoint.info?.description && (
                        <React.Fragment>
                            <Text variant="header-s" top="xl">
                                {i18n('Описание')}
                            </Text>
                            <Text variant="m" top="xs">
                                {pickupPoint.info?.description}
                            </Text>
                        </React.Fragment>
                    )}

                    {/* Описание того как до точки добраться */}
                    {pickupPoint.info?.tripDescription && (
                        <React.Fragment>
                            <Text variant="header-s" top="xl">
                                {i18n('Как добраться')}
                            </Text>
                            <Text variant="m" top="xs">
                                {pickupPoint.info?.tripDescription}
                            </Text>
                        </React.Fragment>
                    )}
                </React.Fragment>
            ) : (
                <Col align="center" justify="center">
                    <PickupLoader />
                </Col>
            )}
        </Panel>
    );
}
