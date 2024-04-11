import React from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { startPaymentProcessService } from 'store/checkout';

import { Button, ButtonProps } from '../../../../components/button';
import { NEW_CARD_KEY, CASH_KEY } from '../../../../helpers/payment-method';
import { isCheckoutAvailable } from '../../../../store/mix';
import { getCurrencyCode } from '../../../../store/payment';
import { getActivePaymentId } from '../../../../store/payment-methods';
import { isPayWithSplit, getSplitFirstPayAmount } from '../../../../store/split';

const i18n = (v: string) => v;

const baseProps: ButtonProps = {
    view: 'action',
    variant: 'primary',
    size: 'l',
    width: 'max',
    pin: 'round-m',
};

export function MainPayButton(): JSX.Element {
    const startPaymentProcess = useService(startPaymentProcessService);

    const currencyCode = useSelector(getCurrencyCode);
    const selectedPaymentMethodId = useSelector(getActivePaymentId);
    const isCheckoutEnabled = useSelector(isCheckoutAvailable);
    const payWithSplit = useSelector(isPayWithSplit);
    const splitFirstPayAmount = useSelector(getSplitFirstPayAmount);

    let buttonText = i18n('Оплатить');

    if (selectedPaymentMethodId === NEW_CARD_KEY) {
        buttonText = i18n('Перейти к оплате');
    }

    if (selectedPaymentMethodId === CASH_KEY) {
        buttonText = i18n('Оформить заказ');
    }

    if (payWithSplit) {
        return (
            <Button
                {...baseProps}
                variant="split"
                disabled={!isCheckoutEnabled}
                amount={splitFirstPayAmount}
                currency={currencyCode}
                onClick={startPaymentProcess}
            >
                {buttonText}
            </Button>
        );
    }

    return (
        <Button {...baseProps} disabled={!isCheckoutEnabled} onClick={startPaymentProcess}>
            {buttonText}
        </Button>
    );
}
