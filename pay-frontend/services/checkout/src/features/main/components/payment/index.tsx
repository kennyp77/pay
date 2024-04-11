import React, { useEffect, useState } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { numberWord } from '@trust/utils/string';
import { useSelector } from 'react-redux';

import { Amount } from '../../../../components/amount';
import { PaymentOrCardRawIcon, PaymentType } from '../../../../components/bank-card-icon';
import { Col, ColProps } from '../../../../components/col';
import { Icon, SvgIcon } from '../../../../components/icons';
import QuestionSvg from '../../../../components/icons/assets/question.svg';
import { Link } from '../../../../components/link';
import { ListButtonDefault } from '../../../../components/list-button';
import { Text } from '../../../../components/text';
import { CASH_KEY, NEW_CARD_KEY } from '../../../../helpers/payment-method';
import { Path } from '../../../../router';
import { isCouponAvailable, getCashbackAmount } from '../../../../store/payment';
import { getActivePaymentId, getActivePaymentMethod } from '../../../../store/payment-methods';
import { isPayWithSplit } from '../../../../store/split';
import { CouponWidget } from '../../../coupon/widget';

import YaPlusIcon from './assets/ya-plus.svg';

import './styles.scss';

const cnMainPaymentBlock = cn('MainPaymentBlock');

interface MainPaymentBlockProps extends IClassNameProps, ColProps {
    size: 'l' | 'xl';
    separator?: React.ReactElement;
}

const i18n = (v: string) => v;

export function MainPaymentBlock({
    size,
    separator,
    ...props
}: MainPaymentBlockProps): JSX.Element {
    const [paymentIcon, setPaymentIcon] = useState<SvgIcon>();
    const [paymentText, setPaymentText] = useState<string>('');

    const selectedPaymentMethod = useSelector(getActivePaymentMethod);
    const selectedPaymentMethodId = useSelector(getActivePaymentId);
    const payWithSplit = useSelector(isPayWithSplit);
    const cashbackAmount = useSelector(getCashbackAmount);
    const acceptCoupons = useSelector(isCouponAvailable);

    useEffect(() => {
        if (selectedPaymentMethod) {
            setPaymentIcon(PaymentOrCardRawIcon(selectedPaymentMethod.issuer));
            setPaymentText(
                [selectedPaymentMethod.system, '•••', selectedPaymentMethod.lastDigits].join(' '),
            );
        } else {
            setPaymentIcon(PaymentOrCardRawIcon(selectedPaymentMethodId as PaymentType));

            if (selectedPaymentMethodId === NEW_CARD_KEY) {
                setPaymentText(i18n('Оплата новой картой'));
            }

            if (selectedPaymentMethodId === CASH_KEY) {
                setPaymentText(i18n('Наличными при получении'));
            }
        }
    }, [selectedPaymentMethodId, selectedPaymentMethod]);

    return (
        <Col {...props}>
            <ListButtonDefault
                href={Path.PaymentMethods}
                iconLeft={paymentIcon ? <Icon svg={paymentIcon} size="l" /> : null}
                size={size}
            >
                <Text>{paymentText}</Text>
            </ListButtonDefault>

            {Number(cashbackAmount) > 0 && (
                <React.Fragment>
                    {separator}

                    <ListButtonDefault
                        iconLeft={<Icon svg={YaPlusIcon} size="l" />}
                        size={size}
                        iconRight=""
                    >
                        <span>
                            <Text inline>{i18n('Кешбэк')}</Text>{' '}
                            <Text inline color="plus">
                                <Amount amount={cashbackAmount} currency="" />
                                {i18n(
                                    `${numberWord(Number(cashbackAmount), [
                                        'балл',
                                        'балла',
                                        'баллов',
                                    ])} Плюса`,
                                )}
                            </Text>
                            {payWithSplit ? (
                                <Text inline left="xs">
                                    <Link href={Path.AboutSplitPlus}>
                                        <Icon
                                            className={cnMainPaymentBlock('Question')}
                                            size="s"
                                            svg={QuestionSvg}
                                        />
                                    </Link>
                                </Text>
                            ) : null}
                        </span>
                    </ListButtonDefault>
                </React.Fragment>
            )}
            {acceptCoupons ? (
                <React.Fragment>
                    {separator}
                    <CouponWidget />
                </React.Fragment>
            ) : null}
        </Col>
    );
}
