import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { Amount } from 'components/amount';
import { BankCardIcon } from 'components/bank-card-icon';
import { Box } from 'components/box';
import { Button } from 'components/button';
import { Col } from 'components/col';
import { Divider } from 'components/divider';
import { Icon } from 'components/icons';
import { Panel } from 'components/panel';
import { PayLogo } from 'components/pay-logo';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { PROFILE_URL } from 'config';
import { MainCart } from 'features/main/components/cart';
import { getReadableCardInfo } from 'helpers/user-card';

import { SplitPlan } from '../plan';
import { formatDayMonth } from '../plan/utils';

import SplitSuccessIcon from './assets/split-success.svg';

import './index.scss';

const cnSplitSuccess = cn('SplitSuccess');

const i18n = (v: string) => v;

interface SplitSuccessProps extends IClassNameProps {
    width?: 'fixed' | 'auto';
    plan: null | Checkout.SplitPlan;
    firstPayAmount: Sdk.Price;
    remainedAmount: null | Sdk.Price;
    cashbackAmount: Sdk.Price;
    activePaymentMethod?: Checkout.PaymentMethod;
    nextPaymentDatetime: null | Date;
    currencyCode: string;
    onComplete: Sys.CallbackFn0;
}

export const SplitSuccessInfo: React.FC<SplitSuccessProps> = React.memo(
    ({
        width,
        plan,
        onComplete,
        firstPayAmount,
        remainedAmount,
        activePaymentMethod,
        nextPaymentDatetime,
        cashbackAmount,
        currencyCode,
    }) => {
        return (
            <Panel
                className={cnSplitSuccess({ width })}
                footer={
                    <Button
                        view="action"
                        variant="split"
                        size="l"
                        width="max"
                        pin="round-m"
                        className={cnSplitSuccess('ButtonComplete')}
                        onClick={onComplete}
                    >
                        {i18n('Вернуться в магазин')}
                    </Button>
                }
            >
                <Box>
                    <PayLogo />
                </Box>
                <Col top="m" justify="center">
                    <Icon svg={SplitSuccessIcon} className={cnSplitSuccess('Icon')} />
                    <Text top="l" className={cnSplitSuccess('PayAmount')}>
                        <Amount amount={`-${firstPayAmount}`} currency={currencyCode} />
                    </Text>
                    {remainedAmount ? (
                        <Text top="2xs">
                            {i18n('Осталось оплатить')}{' '}
                            <Amount amount={remainedAmount} currency={currencyCode} />
                        </Text>
                    ) : null}
                </Col>

                <Box top="xl">
                    <Divider color="grey" />
                </Box>

                <Box top="xl">
                    <Text variant="header-s" className={cnSplitSuccess('NextPayment')} bottom="m">
                        {i18n('Следующий платеж')}
                    </Text>
                    {plan ? <SplitPlan plan={plan} /> : null}
                    <Text top="m">
                        <span>{i18n('График платежей можно посмотреть')}</span>
                        <br />
                        <a className={cnSplitSuccess('IDLink')} target="_blank" href={PROFILE_URL}>
                            {i18n('в вашем Яндекс.ID')}
                        </a>
                    </Text>
                </Box>

                <Box top="xl">
                    <Divider color="grey" />
                </Box>

                {activePaymentMethod ? (
                    <Box top="l">
                        <Row align="center">
                            <BankCardIcon issuer={activePaymentMethod.issuer} />
                            <Text left="m">{getReadableCardInfo(activePaymentMethod)}</Text>
                        </Row>
                        {nextPaymentDatetime ? (
                            <Text top="m">
                                {formatDayMonth(nextPaymentDatetime)}{' '}
                                {i18n(
                                    'спишутся деньги за второй платеж, не забудьте пополнить карту',
                                )}
                            </Text>
                        ) : null}
                    </Box>
                ) : null}

                <Box top="xl">
                    <Divider color="grey" />
                </Box>

                <Box top="xl">
                    <MainCart />
                    {Number(cashbackAmount) > 0 ? (
                        <Text className={cnSplitSuccess('PlusInfo')} variant="s" color="grey">
                            {i18n('Баллы будут начислены после последнего платежа')}
                        </Text>
                    ) : null}
                </Box>
            </Panel>
        );
    },
);
