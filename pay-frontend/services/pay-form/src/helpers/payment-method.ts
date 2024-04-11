import map from '@tinkoff/utils/array/map';
import prop from '@tinkoff/utils/object/prop';
import { getBankCardByUserCard } from '@trust/utils/payment-methods/bank-card';
import { getPaymentMethodByBankCard } from '@trust/utils/payment-methods/payment-method';
import {
    PaymentMethod,
    PaymentMethodType,
    CardPaymentMethod,
    NewCardPaymentMethod,
    UserCard,
    UserCardId,
} from '@trust/utils/payment-methods/typings';

export const getPaymentMethodByUserCard = (card: UserCard, disabledCardIds: UserCardId[]): CardPaymentMethod => {
    const bankCard = getBankCardByUserCard(card, disabledCardIds);

    return getPaymentMethodByBankCard(bankCard);
};

export const getPaymentMethodsByUserCards = (cards: UserCard[], disabledCardIds: UserCardId[]): PaymentMethod[] =>
    cards.map((card) => getPaymentMethodByUserCard(card, disabledCardIds));

export const createNewCardPaymentMethod = (): NewCardPaymentMethod => {
    return {
        type: PaymentMethodType.NewCard,
        key: '__NEW_CARD__',
        disabled: false,
    };
};

export const findNewPaymentMethod = (
    oldPaymentMethods: PaymentMethod[],
    newPaymentMethods: PaymentMethod[],
): void | PaymentMethod => {
    const oldIds: string[] = map(prop('id'), oldPaymentMethods);

    const newMethod = newPaymentMethods.find((method) => {
        if (method.type === PaymentMethodType.Card) {
            return !oldIds.includes(method.id);
        }

        return false;
    });

    return newMethod || undefined;
};
