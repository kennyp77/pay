import React from 'react';

import { ErrorBase } from 'components/error-base';

const i18n = (v: string) => v;

interface PaymentFailedProps {
    onClose: Sys.CallbackFn0;
    reason?: string;
    action?: {
        text: string;
        callback: Sys.CallbackFn0;
    };
}

export function PaymentFailed({ onClose, reason, action }: PaymentFailedProps) {
    return (
        <ErrorBase
            message={i18n('Произошла ошибка')}
            description={reason || ''}
            closeAction={onClose}
            useActionButton
            action={action?.callback}
            actionText={action?.text}
        />
    );
}
