import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import propOr from '@tinkoff/utils/object/propOr';
import {
    defineCsrfToken,
    defineSessionId,
    loadUserCards as _loadUserCards,
    loadCashback as _loadCashback,
    loadUserSettings,
    loadSplitPlans,
} from '@trust/pay-api';
import { logError } from '@trust/rum';
import { PaymentCashback, UserCard } from '@trust/utils/payment-methods/typings';
import { sortUserCards } from '@trust/utils/payment-methods/user-card';
import { getMerchantUrl, getOrderAmount } from '@trust/utils/payment-sheet';
import { InitPaymentSheet } from '@yandex-pay/sdk/src/typings';

import { IS_AUTH, CSRF_TOKEN, METRIKA_SESSION_ID, BUTTON_OPTIONS } from './config';
import { isSplitAvailable } from './helpers/split';
import { getFirstUserCard } from './helpers/user-card';

defineCsrfToken(CSRF_TOKEN);
defineSessionId(METRIKA_SESSION_ID);

function calcCashbackPercents(
    paymentSheet: InitPaymentSheet,
    cashback: PaymentCashback,
): PaymentCashback {
    const orderAmount = Number(getOrderAmount(paymentSheet));
    const cashbackAmount = Number(cashback.amount);

    return {
        ...cashback,
        percents: Math.ceil((cashbackAmount / orderAmount) * 100).toFixed(0),
    };
}

const loadSavedUserCard = memoizeOnce((): Promise<string | null> => {
    if (!IS_AUTH) {
        return Promise.resolve(null);
    }

    return loadUserSettings().then((res) => {
        return res.data.userSettings.cardId;
    });
});

const loadUserCards = memoizeOnce((): Promise<UserCard[]> => {
    if (!IS_AUTH) {
        return Promise.resolve([]);
    }

    return _loadUserCards().then((res) => {
        const cards = res.data.cards as UserCard[];

        if (!Array.isArray(cards)) {
            return [];
        }

        return loadSavedUserCard().then((cardId) => {
            return sortUserCards(cards, cardId);
        });
    });
});

export const loadActiveCard = (
    paymentSheet: void | InitPaymentSheet,
): Promise<undefined | UserCard> => {
    if (!paymentSheet) {
        return Promise.resolve(undefined);
    }

    return loadUserCards()
        .then((cards) => getFirstUserCard(paymentSheet, cards))
        .catch((err) => {
            logError(err);

            return undefined;
        });
};

export const loadCashback = (
    paymentSheet: void | InitPaymentSheet,
): Promise<undefined | PaymentCashback> => {
    if (!paymentSheet) {
        return Promise.resolve(undefined);
    }

    return loadActiveCard(paymentSheet)
        .then((card) => _loadCashback({ sheet: paymentSheet, cardId: propOr('id', null, card) }))
        .then((res) => calcCashbackPercents(paymentSheet, res.data.cashback))
        .catch((err) => {
            logError(err);

            return undefined;
        });
};

// @see YANDEXPAY-1913
export const getTele2Cashback = async (
    paymentSheet: void | InitPaymentSheet,
): Promise<undefined | PaymentCashback> => {
    const orderAmount = Number(getOrderAmount(paymentSheet));

    if (
        orderAmount >= 2 &&
        BUTTON_OPTIONS.withGiftBadge10p &&
        getMerchantUrl(paymentSheet) === 'tele2.ru'
    ) {
        return {
            amount: `${Math.floor(orderAmount * 0.1)}`,
            category: 'tele2.ru',
        };
    }

    return undefined;
};

export const getSplitAvailable = (paymentSheet: void | InitPaymentSheet): Promise<boolean> => {
    if (!IS_AUTH || !paymentSheet || !isSplitAvailable(paymentSheet)) {
        return Promise.resolve(false);
    }

    return loadSplitPlans(paymentSheet)
        .then((res) => res.data.plans.length > 0)
        .catch((err) => {
            logError(err);

            return false;
        });
};
