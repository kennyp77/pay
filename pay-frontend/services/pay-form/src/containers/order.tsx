import React, { useCallback, useState, useEffect } from 'react';

import Order from '@trust/ui/components/order';
import OrderEmail from '@trust/ui/components/order-email';
import OrderFooter from '@trust/ui/components/order-footer';
import OrderHeader from '@trust/ui/components/order-header';
import OrderName from '@trust/ui/components/order-name';
import OrderSelectedPaymentMethod from '@trust/ui/components/order-selected-payment-method';
import PlusCashback from '@trust/ui/components/plus-cashback';
import { hasCashback } from '@trust/utils/payment-methods/cashback';
import { CardPaymentMethod, PaymentMethod } from '@trust/utils/payment-methods/typings';
import { useSelector } from 'react-redux';

import { getBillingRequiredFields } from '../helpers/required-fields';
import { useAction } from '../hooks/use-action';
import { redirectToAction } from '../store/app/async-actions';
import { changeEmailAction, changeNameAction } from '../store/payment/actions';
import { checkoutAction } from '../store/payment/async-actions';
import {
    getSheet,
    getTotalAmount,
    getCurrencyCode,
    getUserEmail,
    getOrderItems,
    getUserName,
} from '../store/payment/selectors';
import { getPaymentMethods, getActivePaymentMethod, getCashback } from '../store/user/selectors';
import { AppScreen } from '../typings';

const checkButtonDisabled = ({
    emailValid,
    emailRequired,
    nameValid,
    nameRequired,
    activeMethod,
}: {
    emailValid: boolean;
    emailRequired: boolean;
    nameValid: boolean;
    nameRequired: boolean;
    activeMethod?: PaymentMethod;
}): boolean => {
    if ((emailRequired && !emailValid) || (nameRequired && !nameValid)) {
        return true;
    }

    return activeMethod ? activeMethod.disabled : false;
};

export default function OrderContainer(): JSX.Element {
    const [emailValid, setEmailValid] = useState(false);
    const [nameValid, setNameValid] = useState(false);
    const [buttonTitle, setButtonTitle] = useState('');

    const sheet = useSelector(getSheet);
    const amount = useSelector(getTotalAmount);
    const currency = useSelector(getCurrencyCode);
    const methods = useSelector(getPaymentMethods);
    const activeMethod = useSelector(getActivePaymentMethod);
    const email = useSelector(getUserEmail);
    const name = useSelector(getUserName);
    const cashback = useSelector(getCashback);
    const orderItems = useSelector(getOrderItems);
    const hasSeveralMethods = methods.length > 1;
    const hasActiveMethod = Boolean(activeMethod);
    const emailRequired = getBillingRequiredFields(sheet).email;
    const nameRequired = getBillingRequiredFields(sheet).name;

    const [buttonDisabled, setButtonDisabled] = useState(() =>
        checkButtonDisabled({ emailValid, emailRequired, activeMethod, nameRequired, nameValid }),
    );

    const redirectTo = useAction(redirectToAction);
    const checkout = useAction(checkoutAction);
    const changeEmail = useAction(changeEmailAction);
    const changeName = useAction(changeNameAction);

    const onClickChooseAnother = useCallback(() => {
        redirectTo(AppScreen.PaymentMethods);
    }, [redirectTo]);

    const onClickSubmit = useCallback(() => {
        const cardId = (activeMethod as CardPaymentMethod).id;

        checkout(cardId, sheet);
    }, [activeMethod, sheet, checkout]);

    useEffect(() => {
        setButtonDisabled(
            checkButtonDisabled({
                emailValid,
                emailRequired,
                activeMethod,
                nameRequired,
                nameValid,
            }),
        );

        if (emailRequired && !emailValid) {
            setButtonTitle('Укажите почту');
        } else if (nameRequired && !nameValid) {
            setButtonTitle('Укажите имя');
        } else {
            setButtonTitle('');
        }
    }, [activeMethod, emailValid, emailRequired, nameRequired, nameValid]);

    return (
        <Order
            active
            header={<OrderHeader amount={amount} currency={currency} orderItems={orderItems} />}
            content={
                <>
                    {hasActiveMethod && (
                        <OrderSelectedPaymentMethod
                            method={activeMethod}
                            onClickChooseAnother={hasSeveralMethods ? onClickChooseAnother : null}
                        />
                    )}
                    {emailRequired && (
                        <OrderEmail
                            email={email}
                            onChange={changeEmail}
                            onChangeValidState={setEmailValid}
                        />
                    )}
                    {nameRequired && (
                        <OrderName
                            name={name}
                            onChange={changeName}
                            onChangeValidState={setNameValid}
                        />
                    )}
                    {hasCashback(cashback) && (
                        <PlusCashback category={cashback.category} amount={cashback.amount} />
                    )}
                </>
            }
            footer={
                <OrderFooter
                    amount={amount}
                    currency={currency}
                    buttonDisabled={buttonDisabled}
                    methodDisabled={activeMethod ? activeMethod.disabled : false}
                    onClickSubmit={onClickSubmit}
                    title={buttonTitle}
                />
            }
        />
    );
}
