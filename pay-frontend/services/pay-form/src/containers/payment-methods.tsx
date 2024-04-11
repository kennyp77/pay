import React, { useCallback } from 'react';

import PaymentMethods from '@trust/ui/components/payment-methods';
import PaymentMethodsHeader from '@trust/ui/components/payment-methods-header';
import PaymentMethodsList from '@trust/ui/components/payment-methods-list';
import { PaymentMethod } from '@trust/utils/payment-methods/typings';
import { useSelector } from 'react-redux';

import { useAction } from '../hooks/use-action';
import { redirectToAction } from '../store/app/async-actions';
import { setActivePaymentMethodAction } from '../store/user/async-actions';
import { getPaymentMethods, getActivePaymentMethod } from '../store/user/selectors';
import { AppScreen } from '../typings';

export default function PaymentMethodsContainer(): JSX.Element {
    const methods = useSelector(getPaymentMethods);
    const activeMethod = useSelector(getActivePaymentMethod);

    const redirectTo = useAction(redirectToAction);
    const setActivePaymentMethod = useAction(setActivePaymentMethodAction);

    const onSelectMethod = useCallback((method: PaymentMethod) => {
        setActivePaymentMethod(method);
    }, []);

    const onClickBack = useCallback(() => {
        redirectTo(AppScreen.Order);
    }, []);

    return (
        <PaymentMethods
            active
            header={<PaymentMethodsHeader onClickBack={onClickBack} />}
            content={<PaymentMethodsList methods={methods} activeMethod={activeMethod} onSelect={onSelectMethod} />}
        />
    );
}
