import { Price } from '@yandex-pay/sdk/src/typings';

export type { PaymentSheet, Price } from '@yandex-pay/sdk/src/typings';

/**
 * Временено, будет браться из SDK
 * >>>
 */
type Date = string;
type DateTime = string;
type ContactName = string;
type ContactFirstName = string;
type ContactLastName = string;
type ContactPhone = string;
type ContactEmail = string;

interface GeoCoordinates {
    lat: number;
    lon: number;
}

interface Address {
    country: string;
    city: string;
    street?: string;
    building?: string;
    postcode?: string;
    coordinates?: GeoCoordinates;
}

export interface ShippingContactField {
    email: ContactEmail;
    name: ContactName;
    firstName: ContactFirstName;
    lastName: ContactLastName;
    phone: ContactPhone;
}

export interface ShippingAddress extends Address {
    street: string;
    building: string;
    // квартира (отсутствует если частный дом)
    apartment?: string;
    // этаж (отсутствует если частный дом)
    floor?: string;
    // подъезд (отсутствует если частный дом)
    entrance?: string;
    // домофон
    intercom?: string;
}

export type AddressStr = string;

export enum ShippingType {
    Direct = 'DIRECT',
    Pickup = 'PICKUP',
}

type ShippingCategory = 'express' | 'today' | 'standart';

// Вариант доставки
export interface ShippingOption {
    id: string;
    category: ShippingCategory;
    amount: Price;
    date: Date;
    time?: { from: DateTime; to: DateTime };
    label?: string;
}

/**
 * <<<
 * Временено, будет браться из SDK
 */
