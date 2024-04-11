import { getCardIssuer } from '@trust/bank-cards/issuer';
import { getCardSystem } from '@trust/utils/cards';

import { BankCard, UserCard, UserCardId } from './typings';

export const getBankCardByUserCard = (card: UserCard, disabledCardIds: UserCardId[]): BankCard => ({
    id: card.id,
    uid: String(card.uid),
    lastDigits: card.last4,
    system: getCardSystem(card.cardNetwork),
    issuer: getCardIssuer(card.issuerBank),
    disabled: disabledCardIds.includes(card.id),
});
