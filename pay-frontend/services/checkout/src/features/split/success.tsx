import React, { useCallback } from 'react';

import { useSelector } from 'react-redux';

import { counters } from 'counters';
import { getCashbackAmount, getCurrencyCode } from 'store/payment';
import { getActivePaymentMethod } from 'store/payment-methods';
import {
    getSplitPlan,
    getSplitFirstPayAmount,
    getSplitRemainedAmount,
    getSplitNextPaymentDate,
} from 'store/split';

import { SplitSuccessInfo } from './components/split-success-info';

interface SplitSuccessProps {
    width?: 'fixed' | 'auto';
    onComplete: () => void;
}

export function SplitSuccess({ width = 'auto', onComplete }: SplitSuccessProps) {
    const plan = useSelector(getSplitPlan);

    const firstPayAmount = useSelector(getSplitFirstPayAmount);
    const remainedAmount = useSelector(getSplitRemainedAmount);
    const activePaymentMethod = useSelector(getActivePaymentMethod);
    const nextPaymentDatetime = useSelector(getSplitNextPaymentDate);
    const cashbackAmount = useSelector(getCashbackAmount);
    const currencyCode = useSelector(getCurrencyCode);

    const onSplitComplete = useCallback(() => {
        counters.splitPaymentSuccess();
        onComplete();
    }, [onComplete]);

    return (
        <SplitSuccessInfo
            width={width}
            plan={plan}
            firstPayAmount={firstPayAmount}
            remainedAmount={remainedAmount}
            activePaymentMethod={activePaymentMethod}
            nextPaymentDatetime={nextPaymentDatetime}
            cashbackAmount={cashbackAmount}
            currencyCode={currencyCode}
            onComplete={onSplitComplete}
        />
    );
}
