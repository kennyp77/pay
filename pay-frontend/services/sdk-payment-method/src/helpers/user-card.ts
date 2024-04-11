import { UserCard } from '@trust/utils/payment-methods/typings';
import { createAvailableUserCardsFilter } from '@trust/utils/payment-methods/user-card';
import { InitPaymentSheet } from '@yandex-pay/sdk/src/typings';

const getFirstAvailableUserCard = (sheet: InitPaymentSheet, cards: UserCard[]): UserCard | null => {
    const availableUserCardsFilter = createAvailableUserCardsFilter(sheet);

    return cards.find(availableUserCardsFilter);
};

export const getFirstUserCard = (
    paymentSheet: void | InitPaymentSheet,
    cards: UserCard[],
): undefined | UserCard => {
    if (paymentSheet) {
        return getFirstAvailableUserCard(paymentSheet, cards);
    }

    return cards[0];
};
