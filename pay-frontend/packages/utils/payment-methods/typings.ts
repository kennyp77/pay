import { CardIssuer } from '@trust/bank-cards/typings';

import { CardSystem } from '../cards';

export type UserCardId = string;

export interface UserCard {
    id: UserCardId;
    uid: number;
    last4: string;
    cardNetwork: string;
    issuerBank: string;
    allowedAuthMethods: string[];
}
export type BankCardId = string;

export interface BankCard {
    id: BankCardId;
    // Trust and Pay
    uid?: string;
    // Trust
    number?: string;
    lastDigits: string;
    system: CardSystem;
    issuer: CardIssuer;
    // Trust
    /**
     * TODO: Use the common type.
     */
    currency?: string;
    cvvRequired?: boolean;
    disabled?: boolean;
    meta?: Record<string, any>;
}

export type PaymentMethodKey = string;

export enum PaymentMethodType {
    Card = 'CARD',
    NewCard = 'NEW_CARD',
    Cash = 'CASH',
    Split = 'SPLIT',
}

interface BasePaymentMethod<T> {
    type: T;
    key: PaymentMethodKey;
    disabled: boolean;
}

export type CardPaymentMethod = BasePaymentMethod<PaymentMethodType.Card> & BankCard;

export type NewCardPaymentMethod = BasePaymentMethod<PaymentMethodType.NewCard>;

export type CashPaymentMethod = BasePaymentMethod<PaymentMethodType.Cash>;

export type PaymentMethod = CardPaymentMethod | NewCardPaymentMethod;

export type PaymentCashback = {
    amount: string;
    category: string;
    percents?: string;
};
