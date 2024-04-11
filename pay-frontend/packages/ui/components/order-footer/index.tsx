import React from 'react';

import { IClassNameProps } from '@bem-react/core';
import { block } from 'bem-cn';

import AdditionalInformation from '../additional-information';
import PayButton from '../pay-button';

import './styles.css';

interface OrderFooterProps {
    amount: string;
    currency: string;
    onClickSubmit: () => void;
    buttonDisabled?: boolean;
    methodDisabled?: boolean;
    title?: string;
}

const b = block('order-footer');

export default function OrderFooter({
    amount,
    currency,
    onClickSubmit,
    buttonDisabled = false,
    methodDisabled = false,
    title = '',
}: OrderFooterProps): JSX.Element {
    return (
        <div className={b()}>
            <PayButton
                amount={amount}
                currency={currency}
                onClick={onClickSubmit}
                disabled={buttonDisabled}
                title={methodDisabled ? undefined : title}
            />
            <div className={b('additional')}>
                <AdditionalInformation />
            </div>
        </div>
    );
}
