import React from 'react';

import { block } from 'bem-cn';

import Icon from '../ui/icon';
import Link from '../ui/link';

import './styles.css';

const b = block('payment-methods-header');

interface PaymentMethodsHeaderProps {
    onClickBack: () => void;
}

export default function PaymentMethodsHeader({ onClickBack }: PaymentMethodsHeaderProps): JSX.Element {
    return (
        <div className={b()}>
            <div className={b('title')}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <Link theme="grey" leftIcon={<Icon glyph="chevron" />} onClick={onClickBack}>
                    Вернуться назад
                </Link>
            </div>
            <div className={b('subtitle')}>Карты для оплаты</div>
        </div>
    );
}
