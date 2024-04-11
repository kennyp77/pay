import React, { useCallback, useState } from 'react';

import { Panel, PanelHeader } from 'components/panel';
import { Text } from 'components/text';
import { counters } from 'counters';

import { PaymentAuth3dsForm } from '../components/payment-auth3ds';
import { PaymentLoader } from '../components/payment-loader';

const i18n = (v: string) => v;

interface PaymentAuth3dsProps {
    authFrameUrl: string;
    onComplete: Sys.CallbackFn0;
    onCancel: Sys.CallbackFn0;
}

export function PaymentAuth3ds({ authFrameUrl, onComplete, onCancel }: PaymentAuth3dsProps) {
    const [pending, setPending] = useState(true);

    const onReady = useCallback(() => {
        setPending(false);
        counters.checkout3ds({ state: 'ready' });
    }, [setPending]);

    const onCompleteFn = useCallback(() => {
        counters.checkout3ds({ state: 'complete' });

        onComplete();
    }, [onComplete]);

    const onCancelFn = useCallback(() => {
        counters.checkout3ds({ state: 'cancel' });

        onCancel();
    }, [onCancel]);

    return (
        <Panel header={<PanelHeader title={i18n('Подтверждение')} closeAction={onCancelFn} />}>
            <PaymentAuth3dsForm
                authFrameUrl={authFrameUrl}
                onReady={onReady}
                onComplete={onCompleteFn}
            />

            <PaymentLoader
                progress={pending}
                title={i18n('Пожалуйста подождите')}
                message={i18n('Мы проверяем карту...')}
            />
        </Panel>
    );
}
