import fromPairs from '@tinkoff/utils/object/fromPairs';
import pick from '@tinkoff/utils/object/pick';
import { logError } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { sortUserCards } from '@trust/utils/payment-methods/user-card';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import * as api from '../../api/pay-api';
import { counters } from '../../counters';
import { getPaymentMethodsByUserCards, NEW_CARD_KEY } from '../../helpers/payment-method';
import { getDisabledCardsIds } from '../../helpers/user-card';
import { AppPendingReason } from '../../typings';
import { setPendingScreen, saveUserState, setErrorScreenWithRefresh } from '../app';
import { getSheet, loadCashback } from '../payment';

import { setPaymentMethods, setSelectedId } from './mutators';

const prepareCounterData = (methods: Checkout.PaymentMethod[]): any => {
    const toPairsFrom1 = (arr: any[]): Array<[number, any]> =>
        arr.map((data, idx) => [idx + 1, data]);

    return fromPairs(toPairsFrom1(methods.map(pick(['id', 'system', 'issuer', 'disabled']))));
};

type SelectOptions = {
    initialSet?: boolean;
};

export const selectPaymentMethod = createService<
    RootState,
    [Checkout.PaymentMethodId, Sys.CallbackFn0?, SelectOptions?]
>(async ({ getState, dispatch }, paymentMethodId, next, options = {}) => {
    await dispatch(setSelectedId(paymentMethodId));

    dispatch(loadCashback());

    if (paymentMethodId !== NEW_CARD_KEY) {
        if (!options.initialSet) {
            await dispatch(saveUserState({ cardId: paymentMethodId }));
        }
    }

    if (next) {
        await next();
    }
});

export const refreshPaymentMethods = createService<RootState, [Checkout.PaymentMethodId]>(
    async ({ dispatch, getState }, cardId) => {
        try {
            const response = await api.loadUserCards();
            const cards = sortUserCards(response.data.cards as any, cardId);

            const disabledCardsIds = getDisabledCardsIds(cards, getSheet(getState()));

            const paymentMethods = getPaymentMethodsByUserCards(cards, disabledCardsIds);

            counters.paymentMethods(prepareCounterData(paymentMethods));

            await dispatch(setPaymentMethods(asyncData.success(paymentMethods)));
        } catch (error) {
            logError(error, { fn: 'refreshPaymentMethodsAction' });

            await dispatch(setPaymentMethods(asyncData.error('error_refresh')));

            await dispatch(
                setErrorScreenWithRefresh({
                    reason: 'error_refresh_payment_methods',
                    description: 'Произошла ошибка при загрузке списка банковских карт',
                    action: async () => await dispatch(setPaymentMethods(asyncData.initial())),
                }),
            );
        }
    },
);

export const selectBindedCard = createService<
    RootState,
    [Checkout.TrustCardId, Sys.CallbackFn1<Checkout.PaymentMethodId>?]
>(async function selectBindedCard({ dispatch }, trustCardId, next) {
    const res = await api.syncUserCard(trustCardId, { polling: true });
    const cardId = res.data.id;

    await dispatch(refreshPaymentMethods(cardId));
    dispatch(selectPaymentMethod(cardId));

    if (next) {
        await next(cardId);
    }
});
