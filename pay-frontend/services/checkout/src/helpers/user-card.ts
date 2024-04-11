import toLower from '@tinkoff/utils/string/toLower';
import { CardSystem } from '@trust/utils/cards';
import { getAllowedCardNetworks } from '@trust/utils/payment-methods/payment-sheet';
import { CardPaymentMethod, UserCard, UserCardId } from '@trust/utils/payment-methods/typings';
import { createAvailableUserCardsFilter } from '@trust/utils/payment-methods/user-card';
import { PaymentSheet } from '@yandex-pay/sdk/src/typings';

export const getDisabledCardsIds = (cards: UserCard[], sheet: PaymentSheet): UserCardId[] => {
    const availableUserCardsFilter = createAvailableUserCardsFilter(sheet);

    return cards.filter((card) => !availableUserCardsFilter(card)).map((card) => card.id);
};

export const checkIsCardAllowed = (sheet: PaymentSheet, cardNetwork?: string): boolean => {
    const allowedCardNetworks = getAllowedCardNetworks(sheet).map(toLower);

    if (!cardNetwork) return true;

    return allowedCardNetworks.includes(toLower(cardNetwork));
};

export const getReadableCardSystem = (cardSystem: CardSystem): string => {
    switch (cardSystem) {
        case CardSystem.Mastercard:
            return 'MasterCard';
        case CardSystem.MastercardElite:
            return 'MasterCardElite';
        case CardSystem.Mir:
            return 'Мир';
        default:
            return cardSystem;
    }
};

export const getReadableCardInfo = (method: CardPaymentMethod) =>
    [method.system, '•••', method.lastDigits].join(' ');
