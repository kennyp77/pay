import React from 'react';

import { block } from 'bem-cn';

import Spin from '../ui/spin';

import './styles.css';

interface PaymentPreloaderProps {
    description?: string | JSX.Element;
}

const b = block('payment-preloader');

export default function PaymentPreloader({ description }: PaymentPreloaderProps): JSX.Element {
    return (
        <div className={b()} data-label="payment-preloader">
            <Spin />
            {description && <span className={b('text')}>{description}</span>}
        </div>
    );
}
