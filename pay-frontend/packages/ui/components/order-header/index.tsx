import React from 'react';

import { PaymentCashback } from '@trust/utils/payment-methods/typings';
import { OrderItem } from '@yandex-pay/sdk/src/typings';
import { block } from 'bem-cn';

import OrderAmount from '../order-amount';

import './styles.css';

const b = block('order-header');

interface OrderHeaderProps {
    amount: string;
    originalAmount?: string;
    currency: string;
    orderItems?: OrderItem[];
}

export default function OrderHeader({
    amount,
    originalAmount,
    currency,
    orderItems,
}: OrderHeaderProps): JSX.Element {
    return (
        <div className={b()}>
            <div className={b('title')}>Итого к оплате</div>
            <div className={b('subtitle')}>
                <OrderAmount
                    amount={amount}
                    originalAmount={originalAmount}
                    currency={currency}
                    orderItems={orderItems}
                />
            </div>
        </div>
    );
}
