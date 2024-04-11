import React, { useCallback } from 'react';

import { PaymentAuth3dsFrame } from '@trust/ui/components/auth-3ds';
import { CheckoutProcess } from '@yandex-pay/pay-common';
import { useSelector } from 'react-redux';

import { counters } from '../counters/metrika';
import { useAction } from '../hooks/use-action';
import { resetPendingAction, setPendingAction } from '../store/app/actions';
import { getFrameAuthUrl } from '../store/app/selectors';
import { AppPending } from '../typings';

export function PaymentAuth3dsContainer() {
    const authFrameUrl = useSelector(getFrameAuthUrl);

    const resetPending = useAction(resetPendingAction);
    const setPending = useAction(setPendingAction);

    const onReady = useCallback(() => {
        resetPending();
        counters.checkout3ds({ state: 'ready' });
    }, [resetPending]);

    const onComplete = useCallback(() => {
        counters.checkout3ds({ state: 'complete' });
        setPending(AppPending.Checkout);
    }, [setPending]);

    if (!authFrameUrl) {
        return null;
    }

    return (
        <PaymentAuth3dsFrame
            onReady={onReady}
            onComplete={onComplete}
            authFrameUrl={authFrameUrl}
        />
    );
}
