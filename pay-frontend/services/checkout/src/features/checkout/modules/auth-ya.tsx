import React, { useEffect } from 'react';

import { redirectTo } from '@trust/utils/url';

import { PaymentLoader } from '../components/payment-loader';

const i18n = (v: string) => v;

interface PaymentAuthYaProps {
    redirectUrl: string;
}

export function PaymentAuthYa({ redirectUrl }: PaymentAuthYaProps) {
    useEffect(() => {
        setTimeout(() => redirectTo(redirectUrl), 2000);
    });

    return (
        <PaymentLoader
            progress
            title={i18n('Пожалуйста подождите')}
            message={i18n('Необходимо проверить ваш профиль...')}
        />
    );
}
