import React from 'react';

import { block } from 'bem-cn';

import './styles.css';

const b = block('payment-methods');

interface PaymentMethodsProps {
    active: boolean;
    header: JSX.Element;
    content: JSX.Element;
}

export default function PaymentMethods({ active, header, content }: PaymentMethodsProps): JSX.Element {
    return (
        <div className={b({ active })}>
            <div className={b('header')}>{header}</div>
            <div className={b('content')}>{content}</div>
        </div>
    );
}
