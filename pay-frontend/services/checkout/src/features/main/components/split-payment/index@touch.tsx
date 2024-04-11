import React from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Box } from '../../../../components/box';
import { Icon } from '../../../../components/icons';
import {
    getSplitPlan,
    isPayWithSplit,
    isSplitDisabled,
    togglePayWithSplit,
} from '../../../../store/split';
import { SplitPlan } from '../../../split/components/plan';

import SplitLogoIcon from './assets/split-logo.svg';
import { SplitPaymentInfo } from './components/info';
import { SplitPaymentSelector } from './selector';

export function SplitPayment() {
    const plan = useSelector(getSplitPlan);
    const isActive = useSelector(isPayWithSplit);
    const isDisabled = useSelector(isSplitDisabled);
    const togglePay = useService(togglePayWithSplit);

    if (plan) {
        return (
            <Box all="l">
                <SplitPaymentSelector
                    size="m"
                    disabled={isDisabled}
                    active={isActive}
                    onToggle={togglePay}
                    iconBox={
                        <Box right="m" shrink>
                            <Icon svg={SplitLogoIcon} size="l" />
                        </Box>
                    }
                />
                {isActive ? (
                    <Box top="m" left="2xl">
                        <Box left="m">
                            <SplitPaymentInfo />
                            <Box top="s">
                                <SplitPlan plan={plan} />
                            </Box>
                        </Box>
                    </Box>
                ) : null}
            </Box>
        );
    }

    return null;
}
