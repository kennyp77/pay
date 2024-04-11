import { PaymentMethodType, CardPaymentMethod, BankCard } from './typings';

export const getPaymentMethodByBankCard = (card: BankCard): CardPaymentMethod => ({
    type: PaymentMethodType.Card,
    key: `${PaymentMethodType.Card}${card.id}`,
    disabled: card.disabled === true,
    ...card,
});
