import React, { useEffect } from 'react';

import { PaymentLoader } from '../components/payment-loader';

const i18n = (v: string) => v;

interface PaymentSuccessRedirectProps {
    onComplete: Sys.CallbackFn0;
}

export function PaymentSuccessRedirect({ onComplete }: PaymentSuccessRedirectProps) {
    useEffect(() => {
        setTimeout(onComplete, 2000);
    });

    return (
        <PaymentLoader
            progress
            title={i18n('Пожалуйста подождите')}
            message={
                <>
                    {i18n('Перенаправляем')}
                    <br />
                    {i18n('обратно в интернет-магазин')}
                </>
            }
        />
    );
}
