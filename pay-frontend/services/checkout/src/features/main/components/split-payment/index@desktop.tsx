import React from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Box } from '../../../../components/box';
import { Divider } from '../../../../components/divider';
import {
    getSplitPlan,
    isPayWithSplit,
    isSplitDisabled,
    togglePayWithSplit,
} from '../../../../store/split';
import { SplitPlan } from '../../../split/components/plan';

import { SplitPaymentInfo } from './components/info';
import { SplitPaymentSelector } from './selector';

export function SplitPayment() {
    const plan = useSelector(getSplitPlan);
    const isActive = useSelector(isPayWithSplit);
    const isDisabled = useSelector(isSplitDisabled);
    const togglePay = useService(togglePayWithSplit);

    if (plan) {
        return (
            <Box>
                <SplitPaymentSelector
                    size="s"
                    disabled={isDisabled}
                    active={isActive}
                    onToggle={togglePay}
                />
                {isActive ? <SplitPaymentInfo /> : null}
                <Box top={isActive ? 's' : 'm'}>
                    <SplitPlan plan={plan} disabled={!isActive} />
                </Box>
                <Box top="m">
                    <Divider color="grey" />
                </Box>
            </Box>
        );
    }

    return null;
}
