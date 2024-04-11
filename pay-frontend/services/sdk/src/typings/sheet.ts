/* eslint-disable max-classes-per-file */
/* eslint-disable no-dupe-class-members */

import { TypedObject } from './common';
import { AdditionalFields, RequiredFields } from './sheet-checkout';

/**
 * Общие типы.
 */

// Должно быть больше 0 и не содержать больше двух знаков после запятой.
// Например 1.12, 5.1, 10.
export type Price = string;
export type Count = string;

/**
 * Платежная криптограмма.
 */
export type PaymentToken = string;

/**
 * Тип платежа
 */
export type PaymentType = 'payment' | 'payment-v3' | 'checkout' | 'checkout-v3';

/**
 * Окружение в котором совершается платеж
 */
export enum PaymentEnv {
    Production = 'PRODUCTION',
    Sandbox = 'SANDBOX',
}

/**
 * Код страны по стандарту ISO 3166-1 alpha-2.
 */
export enum CountryCode {
    Ru = 'RU',
    Us = 'US',
    By = 'BY',
}

/**
 * Код валюты по стандарту ISO 4217.
 */
export enum CurrencyCode {
    Rub = 'RUB',
    Byn = 'BYN',
    Usd = 'USD',
    Eur = 'EUR',
    Kzt = 'KZT',
    Uah = 'UAH',
    Amd = 'AMD',
    Gel = 'GEL',
    Azn = 'AZN',
    Kgs = 'KGS',
    Gbp = 'GBP',
    Sek = 'SEK',
    Pln = 'PLN',
    Inr = 'INR',
    Czk = 'CZK',
    Cad = 'CAD',
    Brl = 'BRL',
    Aud = 'AUD',
    Uzs = 'UZS',
    Chf = 'CHF',
    Try = 'TRY',
    Cny = 'CNY',
    Zar = 'ZAR',
    Bgn = 'BGN',
    Ron = 'RON',
    Hkd = 'HKD',
    Aed = 'AED',
}

/**
 * Информация о продавце
 */

export interface Merchant {
    // ID продавца.
    id: string;
    // Имя продавца (отображается на платежной форме).
    name: string;
    // Url продавца (необязательное поле).
    url?: string;
}

/**
 * Информация корзине
 */

export enum OrderItemType {
    Pickup = 'PICKUP',
    Shipping = 'SHIPPING',
    Discount = 'DISCOUNT',
    Promocode = 'PROMOCODE',
}

export type OrderId = string;

export interface OrderTotal {
    amount: Price;
    // Текст для поля total.
    label?: string;
}

export interface OrderItemQuantity {
    count: Count;
    // Текст для описания количества, по умолчанию - шт.
    label?: string;
}

export interface OrderItem {
    id: string;
    amount: Price;
    type?: OrderItemType;
    label?: string;
    quantity?: OrderItemQuantity;
}

export interface Order {
    // ID заказа на стороне продавца.
    id: OrderId;
    items: OrderItem[];
    total: OrderTotal;
}

/**
 * Описание методов оплаты.
 */

export enum PaymentMethodType {
    Card = 'CARD',
    Cash = 'CASH',
    Split = 'SPLIT',
}

export enum AllowedAuthMethod {
    CloudToken = 'CLOUD_TOKEN',
    PanOnly = 'PAN_ONLY',
}

export enum AllowedCardNetwork {
    AmericanExpress = 'AMEX',
    Discover = 'DISCOVER',
    Jcb = 'JCB',
    Mastercard = 'MASTERCARD',
    Visa = 'VISA',
    VisaElectron = 'VISAELECTRON',
    Maestro = 'MAESTRO',
    Mir = 'MIR',
    UnionPay = 'UNIONPAY',
    Uzcard = 'UZCARD',
}

export interface CardPaymentMethod extends TypedObject<PaymentMethodType.Card> {
    // ID поставщика платежных услуг.
    gateway: string;

    // ID магазина в системе поставщика платежных услуг.
    gatewayMerchantId: string;

    // Платежные методы, которые поддерживает поставщик платежных услуг.
    allowedAuthMethods: AllowedAuthMethod[];

    // Платежные системы, которые поддерживает сайт и поставщик платежных услуг.
    allowedCardNetworks: AllowedCardNetwork[];

    // Необходимость верификации через паспорт.
    verificationDetails?: boolean;
}

export type CashPaymentMethod = TypedObject<PaymentMethodType.Cash>;

export type SplitPaymentMethod = TypedObject<PaymentMethodType.Split>;

export type PaymentMethod = CardPaymentMethod | CashPaymentMethod | SplitPaymentMethod;

export interface CardPaymentMethodInfo extends TypedObject<PaymentMethodType.Card> {
    // Дополнительные данные о методе.
    cardLast4: string;
    cardNetwork: string;
}

export interface SplitPaymentMethodInfo extends TypedObject<PaymentMethodType.Split> {
    // Дополнительные данные о методе.
    splitMeta: {
        orderId: string;
        checkoutUrl: string;
    };
    cardLast4: string;
    cardNetwork: string;
}

export type CashPaymentMethodInfo = TypedObject<PaymentMethodType.Cash>;

export type PaymentMethodInfo =
    | CardPaymentMethodInfo
    | SplitPaymentMethodInfo
    | CashPaymentMethodInfo;

/**
 * Настройки платежа
 */

export interface InitPaymentSheet {
    // Версия клиентского SDK
    version: number;

    merchant: Merchant;
    order: Order;
    metadata?: string;
    currencyCode: CurrencyCode;
    paymentMethods?: PaymentMethod[];
}

export interface InitPaymentData extends InitPaymentSheet {
    // @default PRODUCTION
    env?: PaymentEnv;
}

export interface PaymentSheet extends InitPaymentSheet {
    // Необходим для продавцов из Европейской экономической зоны.
    countryCode: CountryCode;
    merchant: Merchant;
    order: Order;
    paymentMethods: PaymentMethod[];

    additionalFields?: AdditionalFields;
    requiredFields?: RequiredFields;
}

export interface PaymentData extends PaymentSheet {
    // @default PaymentEnv.PRODUCTION
    env?: PaymentEnv;
}

/**
 * PaymentSheet для болтификации
 */

interface PaymentCart {
    externalId?: string;
    items: Array<{
        productId: string;
        total: Price;
        quantity?: { count: string };
    }>;
}

export interface UpdatePaymentDataV3 {
    cart: PaymentCart;
    metadata?: string;
}

export interface PaymentSheetV3 {
    version: 3;
    merchantId: string;
    currencyCode: CurrencyCode;

    cart: PaymentCart;
    orderId?: string;
    metadata?: string;
}

export interface PaymentDataV3 extends PaymentSheetV3 {
    // @default PaymentEnv.PRODUCTION
    env?: PaymentEnv;
}
