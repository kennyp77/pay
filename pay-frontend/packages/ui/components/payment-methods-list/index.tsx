import React from 'react';

import { PaymentMethod } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import PaymentMethodDetails from '../payment-method-details';

import './styles.css';

const b = block('payment-methods-list');

interface PaymentMethodsListProps {
    methods: PaymentMethod[];
    activeMethod: PaymentMethod;
    onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodsList({ methods, activeMethod, onSelect }: PaymentMethodsListProps): JSX.Element {
    return (
        <div className={b()} role="listbox">
            {methods.map((method) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                    className={b('item')}
                    key={method.key}
                    role="option"
                    aria-selected={method === activeMethod}
                    tabIndex={0}
                    onClick={method.disabled ? null : (): void => onSelect(method)}
                >
                    <PaymentMethodDetails method={method} selected={method === activeMethod} />
                </div>
            ))}
        </div>
    );
}
