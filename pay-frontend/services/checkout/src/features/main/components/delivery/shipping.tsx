import React, { useEffect, useMemo, useState } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { asyncData } from '@trust/utils/async';
import { useSelector } from 'react-redux';

import { Amount } from '../../../../components/amount';
import { Box } from '../../../../components/box';
import { Col, ColProps } from '../../../../components/col';
import { Icon } from '../../../../components/icons';
import { ExpressIcon } from '../../../../components/icons/express-icon';
import { ListButtonDefault } from '../../../../components/list-button';
import { Loader } from '../../../../components/loader';
import { Row } from '../../../../components/row';
import { Text } from '../../../../components/text';
import { formatDate, formatTime } from '../../../../helpers/date';
import { formatShippingTime, hasDate, isYandexExpress } from '../../../../helpers/shippings';
import { Path } from '../../../../router';
import { getCurrencyCode } from '../../../../store/payment';
import {
    getSelectedShippingOption,
    getShippingOptionsListStatus,
    getSelectShippingOptionsStatus,
    isShippingOptionsDisabled,
    getShippingType,
} from '../../../../store/shipping';
import { ShippingType } from '../../../../typings';

import CourierIcon from './assets/courier.svg';
import RussianPostIcon from './assets/russian-post.svg';
import TimeIcon from './assets/time.svg';

interface MainDeliveryShippingProps extends IClassNameProps, ColProps {
    size: 'l' | 'xl';
}

const i18n = (v: string) => v;

const cnMainDeliveryBlock = cn('MainDeliveryBlock');

export function MainDeliveryShipping({ size }: MainDeliveryShippingProps): JSX.Element {
    const shippingType = useSelector(getShippingType);
    const shippingOption = useSelector(getSelectedShippingOption);
    const shippingListStatus = useSelector(getShippingOptionsListStatus);
    const shippingOptionStatus = useSelector(getSelectShippingOptionsStatus);
    const shippingDisabled = useSelector(isShippingOptionsDisabled);
    const currencyCode = useSelector(getCurrencyCode);
    const [shippingIcon, setShippingIcon] = useState(TimeIcon);
    const [shippingTitle, setShippingTitle] = useState('Доставка курьером');
    const [shippingPage, setShippingPage] = useState(Path.Addresses);

    useEffect(() => {
        if (shippingType === ShippingType.Direct) {
            setShippingPage(Path.Addresses);

            if (shippingOption?.provider === 'RUSSIAN_POST') {
                setShippingIcon(RussianPostIcon);
                setShippingTitle('Доставка');
            } else if (shippingDisabled) {
                setShippingTitle('Доставка');
            } else {
                setShippingIcon(CourierIcon);
                setShippingTitle('Доставка курьером');
            }
        } else {
            setShippingPage(Path.Pickup);
        }
    }, [shippingOption, shippingType, shippingDisabled]);

    const isPending =
        asyncData.isPending(shippingListStatus) || asyncData.isPending(shippingOptionStatus);

    const header = (
        <Box bottom="2xs">
            <ListButtonDefault size={size} href={shippingPage}>
                <Text variant="header-l">{i18n(shippingTitle)}</Text>
            </ListButtonDefault>
        </Box>
    );

    const title = useMemo(() => {
        const russianPostLabel = (
            <Text variant="s" color="grey">
                {i18n('Самовывоз из отделения почты')}
            </Text>
        );

        if (shippingOption) {
            if (hasDate(shippingOption)) {
                return (
                    <Col>
                        <Text>
                            {formatShippingTime(shippingOption)}
                            {', '}
                            <b>
                                <Amount amount={shippingOption.amount} currency={currencyCode} />
                            </b>
                            {isYandexExpress(shippingOption) && (
                                <ExpressIcon className={cnMainDeliveryBlock('ExpressIcon')} />
                            )}
                        </Text>
                        {shippingOption.provider === 'RUSSIAN_POST' ? (
                            russianPostLabel
                        ) : (
                            <Text top="2xs" variant="s" color="grey">{`${i18n('Доставит')} ${
                                shippingOption.label || shippingOption.provider
                            }`}</Text>
                        )}
                    </Col>
                );
            }

            return (
                <Col>
                    <Text>
                        {`${shippingOption.label || shippingOption.provider}, `}
                        <b>
                            <Amount amount={shippingOption.amount} currency={currencyCode} />
                        </b>
                    </Text>
                    {shippingOption.provider === 'RUSSIAN_POST' && russianPostLabel}
                </Col>
            );
        }

        return <Text>{i18n('Выберите доставку')}</Text>;
    }, [shippingOption, currencyCode]);

    if (isPending) {
        return (
            <React.Fragment>
                {header}
                <ListButtonDefault size={size} disabled={isPending}>
                    <Loader
                        progress={isPending}
                        position="left"
                        size="m"
                        fill="white"
                        className={cnMainDeliveryBlock('ListButtonLoader')}
                    >
                        <Row align="center" left="m">
                            <Text color="grey">{i18n('Расчитываем доставку...')}</Text>
                        </Row>
                    </Loader>
                </ListButtonDefault>
            </React.Fragment>
        );
    }

    if (shippingDisabled) {
        return (
            <React.Fragment>
                {header}
                <ListButtonDefault
                    iconLeft={<Icon svg={shippingIcon} size="l" />}
                    iconRight=""
                    size={size}
                    disabled
                >
                    <Text>{i18n('После оформления с вами свяжутся')}</Text>
                </ListButtonDefault>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            {header}
            <ListButtonDefault
                iconLeft={<Icon svg={shippingIcon} size="l" />}
                size={size}
                href={Path.DirectShipping}
            >
                {title}
            </ListButtonDefault>
        </React.Fragment>
    );
}
