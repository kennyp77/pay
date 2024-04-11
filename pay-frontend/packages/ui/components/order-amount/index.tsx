import React, { useMemo } from 'react';

import { OrderItem } from '@yandex-pay/sdk/src/typings';
import { block } from 'bem-cn';

import OrderCart from '../order-cart';
import Amount from '../ui/amount';

import './styles.css';

export interface OrderAmountProps {
    amount: string;
    originalAmount?: string;
    currency: string;
    orderItems?: OrderItem[];
}

const b = block('order-amount');

export default function OrderAmount({
    amount,
    originalAmount,
    currency,
    orderItems,
}: OrderAmountProps): JSX.Element {
    const showOriginalAmount = Boolean(originalAmount) && originalAmount !== amount;
    const showCart = useMemo(() => {
        return Boolean(orderItems && orderItems.length && orderItems.every((item) => item.label));
    }, [orderItems]);

    return (
        <div className={b()}>
            <span className={b('current')}>
                <Amount amount={amount} currency={currency} />
            </span>
            {showOriginalAmount && (
                <span className={b('original')}>
                    <Amount amount={originalAmount} currency={currency} />
                </span>
            )}
            {showCart ? <OrderCart items={orderItems} currency={currency} /> : null}
        </div>
    );
}
