import React, { useEffect, useState } from 'react';

import { OrderItem } from '@yandex-pay/sdk/src/typings';
import { block } from 'bem-cn';

import Amount from '../ui/amount';

import './styles.css';

const b = block('order-cart-item');

interface OrderCartItemProps {
    item: OrderItem;
    currency: string;
}

const MAX_LABEL_LENGTH = 50;

export default function OrderCartItem({ item, currency }: OrderCartItemProps): JSX.Element {
    const [hasTitle, setHasTitle] = useState(false);
    const [visibleText, setVisibleText] = useState(item.label);

    useEffect(() => {
        if (item.label.length > MAX_LABEL_LENGTH) {
            setVisibleText(`${item.label.slice(0, MAX_LABEL_LENGTH)}...`);
            setHasTitle(true);
        }
    }, [item.label]);

    return (
        <tr className={b()}>
            <td>
                <div className={b('label')} title={hasTitle ? item.label : undefined}>
                    {visibleText}
                </div>
            </td>
            <td>
                <div className={b('amount')}>
                    <Amount amount={item.amount} currency={currency} />
                </div>
            </td>
        </tr>
    );
}
