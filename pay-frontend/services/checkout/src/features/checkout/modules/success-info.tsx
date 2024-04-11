import React from 'react';

import { useSelector } from 'react-redux';

import { SplitSuccess } from 'features/split';
import {
    getCashbackAmount,
    getCheckoutPaymentMethod,
    getCurrencyCode,
    getTotalAmount,
} from 'store/payment';
import { getActivePaymentMethod } from 'store/payment-methods';
import { isPayWithSplit } from 'store/split';

import { PaymentOrderInfo } from '../components/payment-order-info';

interface PaymentSuccessInfoProps {
    onComplete: Sys.CallbackFn0;
}

export function PaymentSuccessInfo({ onComplete }: PaymentSuccessInfoProps) {
    const isSplit = useSelector(isPayWithSplit);
    const paymentMethodType = useSelector(getCheckoutPaymentMethod);
    const paymentMethod = useSelector(getActivePaymentMethod);
    const cashbackAmount = useSelector(getCashbackAmount);
    const currencyCode = useSelector(getCurrencyCode);
    const totalAmount = useSelector(getTotalAmount);

    if (isSplit) {
        return <SplitSuccess onComplete={onComplete} />;
    }

    return (
        <PaymentOrderInfo
            paymentMethodType={paymentMethodType}
            paymentMethod={paymentMethod}
            cashbackAmount={cashbackAmount}
            currencyCode={currencyCode}
            totalAmount={totalAmount}
            onComplete={onComplete}
        />
    );
}
