import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { Amount } from '../../../../../../components/amount';
import { Text } from '../../../../../../components/text';
import { getCurrencyCode } from '../../../../../../store/payment';
import {
    getSplitFirstPayAmount,
    getSplitPlan,
    getSplitRemainedAmount,
} from '../../../../../../store/split';

const i18n = (v: string) => v;

export function SplitPaymentInfo() {
    const plan = useSelector(getSplitPlan);
    const currencyCode = useSelector(getCurrencyCode);
    const firstPayAmount = useSelector(getSplitFirstPayAmount);
    const remainedPayAmount = useSelector(getSplitRemainedAmount) ?? '';

    return (
        <React.Fragment>
            <Text top="m" variant="header-s">
                <Amount amount={firstPayAmount} currency={currencyCode} />
                &nbsp;
                <Text inline>{i18n('Сегодня')}</Text>
            </Text>
            <Text top="2xs" variant="s">
                {i18n('и')}
                &nbsp;
                <Amount amount={remainedPayAmount} currency={currencyCode} />
                &nbsp;
                {i18n('потом, без переплат')}
            </Text>
        </React.Fragment>
    );
}
