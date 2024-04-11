import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';

import { counters } from 'counters';
import { SplitErrorType } from 'lib/intercom/split';
import { setSplitAvailable, setPayWithSplit, resetSplitPlan } from 'store/split';

import { SplitFrame } from './components/split-frame';

const i18n = (v: string) => v;

interface SplitFormProps {
    splitFrameUrl: Checkout.SplitFrameUrl;
    onReady: () => void;
    onSuccess: () => void;
    onError: (reason?: string) => void;
    onCancel: () => void;
}

export function SplitForm({
    splitFrameUrl,
    onReady,
    onSuccess,
    onError,
    onCancel,
}: SplitFormProps) {
    const setSplitAvailableFn = useService(setSplitAvailable);
    const setPayWithSplitFn = useService(setPayWithSplit);
    const resetSplitPlanFn = useService(resetSplitPlan);

    const onFrameReady = useCallback(() => {
        counters.splitFrameSuccess();
        onReady();
    }, [onReady]);

    const onFrameError = useCallback(() => {
        counters.splitFrameError();
        onError();
    }, [onError]);

    const onSplitCancel = useCallback(() => {
        counters.splitPaymentCancel();
        onCancel();
    }, [onCancel]);

    const onSplitError = useCallback(
        (error?: SplitErrorType) => {
            counters.splitPaymentError({ error });

            if (error === SplitErrorType.Scoring) {
                counters.splitScoreError();
                counters.splitDeactivate();

                setPayWithSplitFn(false);
                setSplitAvailableFn(false);
                resetSplitPlanFn();
            } else {
                counters.splitUnknownError();
            }

            onError();
        },
        [onError, setSplitAvailableFn, setPayWithSplitFn, resetSplitPlanFn],
    );

    const onSplitSuccess = useCallback(() => {
        counters.splitPaymentSuccess();
        onSuccess();
    }, [onSuccess]);

    return (
        <SplitFrame
            splitFrameUrl={splitFrameUrl}
            onFrameReady={onFrameReady}
            onFrameError={onFrameError}
            onError={onSplitError}
            onCancel={onSplitCancel}
            onSuccess={onSplitSuccess}
        />
    );
}
