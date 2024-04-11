import React from 'react';

import { PaymentMethod, PaymentMethodType } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import CardInfo from '../card-info';
import NewCard from '../new-card';
import Icon from '../ui/icon';

import './styles.css';

const b = block('payment-method-details');

interface PaymentMethodDetailsProps {
    method: PaymentMethod;
    selected?: boolean;
}

export default function PaymentMethodDetails({ method, selected = false }: PaymentMethodDetailsProps): JSX.Element {
    return (
        <div className={b({ selected, disabled: method.disabled })}>
            <div className={b('container')}>
                {method.type === PaymentMethodType.Card ? <CardInfo card={method} /> : <NewCard />}
                <div className={b('selected-icon')}>
                    <Icon glyph="method-check" className={b('check-icon')} />
                </div>
                <div className={b('disabled-icon')}>Недоступно</div>
            </div>
        </div>
    );
}
