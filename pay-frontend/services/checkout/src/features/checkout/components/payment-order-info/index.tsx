import React, { useMemo } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { PaymentMethodType } from '@trust/utils/payment-methods/typings';

import { Amount } from 'components/amount';
import { PaymentOrCardIcon } from 'components/bank-card-icon';
import { Block } from 'components/block';
import { Box } from 'components/box';
import { Button } from 'components/button';
import { Col } from 'components/col';
import { Divider } from 'components/divider';
import { Icon } from 'components/icons';
import { Panel } from 'components/panel';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { MainCart } from 'features/main/components/cart';
import YaPlusIcon from 'features/main/components/payment/assets/ya-plus.svg';
import { CASH_KEY } from 'helpers/payment-method';
import { getReadableCardInfo } from 'helpers/user-card';

import PaymentOrderInfoIcon from './assets/split-success.svg';

import './index.scss';

const cnPaymentOrderInfo = cn('PaymentOrderInfo');

const i18n = (v: string) => v;

interface PaymentOrderInfoProps extends IClassNameProps {
    totalAmount: Sdk.Price;
    currencyCode: string;
    cashbackAmount: Sdk.Price;
    paymentMethodType: PaymentMethodType;
    paymentMethod?: Checkout.PaymentMethod;
    onComplete: Sys.CallbackFn0;
}

export function PaymentOrderInfo({
    paymentMethodType,
    paymentMethod,
    totalAmount,
    currencyCode,
    cashbackAmount,
    onComplete,
}: PaymentOrderInfoProps) {
    const typeOrIssuer = useMemo(() => {
        if (paymentMethodType === 'CASH') {
            return CASH_KEY;
        }

        if (paymentMethodType === 'CARD' && paymentMethod) {
            return paymentMethod.issuer;
        }

        return null;
    }, [paymentMethodType, paymentMethod]);

    const methodHeader = useMemo(() => {
        if (paymentMethodType === 'CASH') {
            return i18n('Способ оплаты');
        }

        if (paymentMethodType === 'CARD') {
            return i18n('Карта для оплаты');
        }

        return null;
    }, [paymentMethodType]);

    const methodText = useMemo(() => {
        if (paymentMethodType === 'CASH') {
            return i18n('Наличными при получении');
        }

        if (paymentMethodType === 'CARD' && paymentMethod) {
            return getReadableCardInfo(paymentMethod);
        }

        return null;
    }, [paymentMethodType, paymentMethod]);

    return (
        <Panel
            className={cnPaymentOrderInfo()}
            footer={
                <Button
                    view="action"
                    variant="primary"
                    size="l"
                    width="max"
                    pin="round-m"
                    className={cnPaymentOrderInfo('ButtonComplete')}
                    onClick={onComplete}
                >
                    {i18n('Вернуться в магазин')}
                </Button>
            }
        >
            <Col top="xs" justify="center">
                <Icon svg={PaymentOrderInfoIcon} className={cnPaymentOrderInfo('Icon')} />

                {paymentMethodType === 'CASH' ? (
                    <Text top="m" variant="header-l">
                        {i18n('Заказ создан')}
                    </Text>
                ) : (
                    <Text top="l" className={cnPaymentOrderInfo('PayAmount')}>
                        <Amount amount={`-${totalAmount}`} currency={currencyCode} fullFraction />
                    </Text>
                )}

                {Number(cashbackAmount) > 0 ? (
                    <Block radius="s" shadow>
                        <Row align="center" left="xs" right="xs">
                            <Text color="plus">{i18n('Кешбэк')}</Text>
                            <Icon svg={YaPlusIcon} size="m" />
                            <Text color="plus">
                                <Amount amount={cashbackAmount} currency="" />
                            </Text>
                        </Row>
                    </Block>
                ) : null}
            </Col>

            <Box top="xl">
                <Divider color="grey" />
            </Box>

            <Box top="l">
                <Row align="center">
                    {typeOrIssuer ? <PaymentOrCardIcon typeOrIssuer={typeOrIssuer} /> : null}
                    <Col left="m">
                        <Text variant="s" color="grey">
                            {methodHeader}
                        </Text>
                        <Text top="2xs">{methodText}</Text>
                    </Col>
                </Row>
            </Box>

            <Box top="l">
                <Divider color="grey" />
            </Box>

            <Box top="xl">
                <MainCart hideQuantity />
            </Box>
        </Panel>
    );
}
