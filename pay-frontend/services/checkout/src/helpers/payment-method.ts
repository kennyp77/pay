import { getBankCardByUserCard } from '@trust/utils/payment-methods/bank-card';
import { getPaymentMethodByBankCard } from '@trust/utils/payment-methods/payment-method';
import {
    PaymentMethodType,
    CardPaymentMethod,
    NewCardPaymentMethod,
    UserCard,
    UserCardId,
} from '@trust/utils/payment-methods/typings';

export const CASH_KEY = '__CASH__';
export const NEW_CARD_KEY = '__NEW_CARD__';

export const getPaymentMethodByUserCard = (card: UserCard, disabledCardIds: UserCardId[]): CardPaymentMethod => {
    const bankCard = getBankCardByUserCard(card, disabledCardIds);

    return getPaymentMethodByBankCard(bankCard);
};

export const getPaymentMethodsByUserCards = (cards: UserCard[], disabledCardIds: UserCardId[]): CardPaymentMethod[] =>
    cards.map((card) => getPaymentMethodByUserCard(card, disabledCardIds));

export const createNewCardPaymentMethod = (): NewCardPaymentMethod => {
    return {
        type: PaymentMethodType.NewCard,
        key: NEW_CARD_KEY,
        disabled: false,
    };
};
