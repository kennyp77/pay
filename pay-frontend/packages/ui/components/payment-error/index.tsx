import React from 'react';

import { block } from 'bem-cn';

import './styles.css';

interface PaymentErrorProps {
    message: string;
    description: string;
}

const b = block('payment-error');

export default function PaymentError({ message, description }: PaymentErrorProps): JSX.Element {
    return (
        <div className={b()}>
            <div className={b('message')}>{message}</div>
            <div className={b('description')}>{description}</div>
        </div>
    );
}
