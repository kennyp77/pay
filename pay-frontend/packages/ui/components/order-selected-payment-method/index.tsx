import React from 'react';

import { PaymentMethod } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import PaymentMethodDetails from '../payment-method-details';
import Icon from '../ui/icon';
import Link from '../ui/link';

import './styles.css';

interface OrderSelectedPaymentMethodProps {
    method: PaymentMethod;
    onClickChooseAnother?: () => void;
}

const b = block('order-selected-payment-method');

export default function OrderSelectedPaymentMethod({
    method,
    onClickChooseAnother,
}: OrderSelectedPaymentMethodProps): JSX.Element {
    const showChooseAnotherLink = Boolean(onClickChooseAnother);

    return (
        <div className={b({ single: !showChooseAnotherLink })}>
            {showChooseAnotherLink && (
                <div className={b('link')}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link theme="grey" rightIcon={<Icon glyph="chevron" />} onClick={onClickChooseAnother}>
                        Другая карта
                    </Link>
                </div>
            )}
            <div className={b('method')}>
                <PaymentMethodDetails method={method} />
            </div>
        </div>
    );
}
