import React, { useCallback, useState } from 'react';

import { Panel } from 'components/panel';
import { SplitForm } from 'features/split';

import { PaymentLoader } from '../components/payment-loader';

interface PaymentSplitProps {
    splitFrameUrl: string;
    onSuccess: Sys.CallbackFn0;
    onError: Sys.CallbackFn1<string | undefined>;
    onCancel: Sys.CallbackFn1;
}

const i18n = (v: string) => v;

export function SplitPayment({ splitFrameUrl, onSuccess, onError, onCancel }: PaymentSplitProps) {
    const [pending, setPending] = useState(true);

    const onFrameReady = useCallback(() => {
        setPending(false);
    }, []);

    return (
        <Panel>
            <SplitForm
                splitFrameUrl={splitFrameUrl}
                onReady={onFrameReady}
                onError={onError}
                onCancel={onCancel}
                onSuccess={onSuccess}
            />

            <PaymentLoader
                progress={pending}
                title={i18n('Пожалуйста подождите')}
                message={i18n('Происходит оплата...')}
            />
        </Panel>
    );
}
