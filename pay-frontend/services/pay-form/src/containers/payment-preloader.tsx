import React from 'react';

import PaymentPreloader from '@trust/ui/components/payment-preloader';
import UiBlocker from '@trust/ui/components/ui-blocker';
import { useSelector } from 'react-redux';

import { getPending } from '../store/app/selectors';
import { AppPending } from '../typings';

// TODO: Texts
const preloaderDescriptionsMap = __DEV__
    ? {
          [AppPending.PaymentSheetLoading]: 'Загружаются данные о платеже',
          [AppPending.PaymentMethodsLoading]: 'Загружаются доступные методы оплаты',
          [AppPending.CardBindingFormLoading]: 'Загружается форма привязки карты',
          [AppPending.CardBinding]: 'Привязывается карта',
          [AppPending.Checkout]: 'Производится оплата',
          [AppPending.ChallengeRequired]: 'Производится перенаправление для верификации',
          [AppPending.Checkout3ds]: 'Мы проверяем карту...',
      }
    : {
          [AppPending.PaymentSheetLoading]: 'Пожалуйста, подождите',
          [AppPending.PaymentMethodsLoading]: 'Пожалуйста, подождите',
          [AppPending.CardBindingFormLoading]: 'Пожалуйста, подождите',
          [AppPending.CardBinding]: 'Пожалуйста, подождите',
          [AppPending.Checkout]: 'Производится оплата',
          [AppPending.ChallengeRequired]: 'Пожалуйста, подождите',
          [AppPending.Checkout3ds]: 'Мы проверяем карту...',
      };

const uiBlockers = [
    AppPending.CardBinding,
    AppPending.Checkout,
    AppPending.ChallengeRequired,
    AppPending.Checkout3ds,
];

export default function PaymentPreloaderContainer(): JSX.Element {
    const pending = useSelector(getPending);
    const description = preloaderDescriptionsMap[pending];
    const blockUI = uiBlockers.includes(pending);

    return (
        <>
            <PaymentPreloader description={description} />
            {blockUI && <UiBlocker />}
        </>
    );
}
