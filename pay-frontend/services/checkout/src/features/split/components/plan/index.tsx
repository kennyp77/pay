import React, { useMemo } from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { Amount } from '../../../../components/amount';
import { Text } from '../../../../components/text';
import { getCurrencyCode } from '../../../../store/payment';

import { getRenderPayments } from './utils';

import './styles.scss';

const cnSplitPlan = cn('SplitPlan');

interface SplitPlanProps {
    plan: Checkout.SplitPlan;
    disabled?: boolean;
}

export const SplitPlan: React.FC<SplitPlanProps> = React.memo(({ plan, disabled = false }) => {
    const currency = useSelector(getCurrencyCode);
    const payments = useMemo(() => getRenderPayments(plan), [plan]);

    if (payments.length === 0) {
        return null;
    }

    return (
        <ul className={cnSplitPlan()}>
            {payments.map((payment, idx) => (
                <li key={idx} className={cnSplitPlan('Item')} style={{ flexGrow: payment.weight }}>
                    <span
                        className={cnSplitPlan('PayLine', {
                            status: payment.status,
                            next: payment.isNext,
                            disabled,
                        })}
                    />
                    <Text
                        color={payment.isNext && !disabled ? 'black' : 'grey'}
                        variant="s"
                        top="2xs"
                    >
                        {payment.date}
                    </Text>
                    <Text
                        className={cnSplitPlan('Pay-Amount')}
                        color={payment.isNext && !disabled ? 'black' : 'grey'}
                        variant="s"
                        top="3xs"
                    >
                        <Amount amount={payment.amount} currency={currency} />
                    </Text>
                </li>
            ))}
        </ul>
    );
});
