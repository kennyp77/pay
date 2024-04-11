import React from 'react';

import PaymentPreloader from '@trust/ui/components/payment-preloader';
import PaymentStatus, { PaymentStatusType } from '@trust/ui/components/payment-status';
import UiBlocker from '@trust/ui/components/ui-blocker';
import { useSelector } from 'react-redux';

import { METRIKA_SESSION_ID } from '../config';
import { getActionError, getScreen } from '../store/app/selectors';
import { AppScreen } from '../typings';

import BindCardContainer from './bind-card';
import { PaymentAuth3dsContainer } from './checkout-3ds';
import OrderContainer from './order';
import PaymentMethodsContainer from './payment-methods';

export default function PaymentContentContainer(): JSX.Element {
    const screen = useSelector(getScreen);
    const error = useSelector(getActionError);

    switch (screen) {
        case AppScreen.Order:
            return <OrderContainer />;

        case AppScreen.BindCard:
            return <BindCardContainer />;

        case AppScreen.PaymentMethods:
            return <PaymentMethodsContainer />;

        case AppScreen.CheckoutServerSuccess:
            return (
                <>
                    <PaymentPreloader description="Перенаправляем обратно в интернет-магазин" />
                    <UiBlocker />
                </>
            );

        case AppScreen.Success:
            return (
                <>
                    <PaymentPreloader description="Производится оплата" />
                    <UiBlocker />
                </>
            );

        case AppScreen.Checkout3ds:
            return <PaymentAuth3dsContainer />;

        case AppScreen.PaymentSheetValidatingError:
            return (
                <PaymentStatus
                    type={PaymentStatusType.Failure}
                    description={
                        <>
                            Извините, в&nbsp;данном магазине оплата с&nbsp;Yandex&nbsp;Pay
                            недоступна.
                        </>
                    }
                    sessionId={METRIKA_SESSION_ID}
                />
            );

        default:
            return (
                <PaymentStatus
                    type={PaymentStatusType.Failure}
                    description={
                        error ? (
                            error.description
                        ) : (
                            <>
                                Извините, что-то пошло не&nbsp;так,
                                <br />
                                попробуйте позже.
                            </>
                        )
                    }
                    sessionId={METRIKA_SESSION_ID}
                    action={error?.action}
                    actionText={error?.actionText}
                />
            );
    }
}
