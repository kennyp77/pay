import intersection from '@tinkoff/utils/array/intersection';
import toArray from '@tinkoff/utils/array/toArray';
import toLower from '@tinkoff/utils/string/toLower';
import { move } from '@trust/utils/array';
import { InitPaymentSheet } from '@yandex-pay/sdk/src/typings';

import { getAllowedCardNetworks, getAllowedAuthMethods } from './payment-sheet';
import { UserCard } from './typings';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createAvailableUserCardsFilter = (sheet: InitPaymentSheet) => {
    const allowedCardNetworks = getAllowedCardNetworks(sheet).map(toLower);
    const allowedAuthMethods = getAllowedAuthMethods(sheet).map(toLower);

    return (card: UserCard): boolean => {
        const cardNetwork = toLower(card.cardNetwork);

        if (allowedCardNetworks.length > 0 && !allowedCardNetworks.includes(cardNetwork)) {
            return false;
        }

        const cardAuthMethods = toArray(card.allowedAuthMethods).filter(Boolean).map(toLower);

        if (
            allowedAuthMethods.length > 0 &&
            intersection(allowedAuthMethods, cardAuthMethods).length === 0
        ) {
            return false;
        }

        return true;
    };
};

export const sortUserCards = (cards: UserCard[], cardId?: string): UserCard[] => {
    const savedCardIndex = cards.findIndex((card) => card.id === cardId);

    if (savedCardIndex > 0) {
        move(cards, savedCardIndex, 0);
    }

    return cards;
};
