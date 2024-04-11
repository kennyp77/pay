/* eslint-disable max-classes-per-file */
/* eslint-disable no-dupe-class-members */

import { TypedObject } from './common';
import { CurrencyCode, Order, PaymentEnv } from './sheet';

/**
 * Общие типы.
 */
// Должно быть больше 0 и не содержать больше двух знаков после запятой.
// Например 1.12, 5.1, 10.
type Price = string;

type Date = number;
type DateTime = number;
type ContactPhone = string;
type ContactEmail = string;
type ContactName = string;

export type Coupon = string;

export type Latitude = number;
export type Longitude = number;
export interface GeoPoint {
    latitude: Latitude;
    longitude: Longitude;
}
export interface GeoBounds {
    sw: GeoPoint;
    ne: GeoPoint;
}

interface Address {
    country: string;
    locality: string;
    street?: string;
    building?: string;
    zip?: string;
    location?: GeoPoint;
}

type AddressStr = string;

/**
 * Информация о заказе — получателе, доставке, скидках и доп. полях
 */

export interface BillingContactInfo {
    email?: ContactEmail;
    name?: ContactName;
}

// Контактная информация получателя
export interface ShippingContactInfo {
    firstName: string;
    secondName: string;
    lastName: string;
    email: ContactEmail;
    phone?: ContactPhone;
}

// Адрес доставки
export interface ShippingAddress extends Address {
    street: string;
    building: string;
    // квартира (отсутствует если частный дом)
    room?: string;
    // подъезд (отсутствует если частный дом)
    entrance?: string;
    // этаж (отсутствует если частный дом)
    floor?: string;
    // домофон
    intercom?: string;
}

// Выбранный способ доставки
export enum ShippingType {
    Direct = 'DIRECT',
    Pickup = 'PICKUP',
}

export interface ShippingDirectInfo extends TypedObject<ShippingType.Direct> {
    shippingAddress: ShippingAddress;
    // отсутствует если мерчант не передал варианты доставки
    shippingOption?: ShippingOption;
}

export interface ShippingPickupInfo extends TypedObject<ShippingType.Pickup> {
    pickupPoint: PickupPoint;
}

export type ShippingMethodInfo = ShippingDirectInfo | ShippingPickupInfo;

export interface AdditionalInfo {
    comment?: string;
    coupon?: Coupon;
}

/**
 * Запрашиваемая информация
 */

export interface RequiredBillingContactFields {
    email?: boolean;
    name?: boolean;
}

export interface RequiredShippingContactFields {
    name: boolean;
    email: boolean;
    phone?: boolean;
}

export interface RequiredShippingTypes {
    direct?: boolean;
    pickup?: boolean;
}

export interface RequiredFields {
    billingContact?: RequiredBillingContactFields;
    shippingContact?: RequiredShippingContactFields;
    shippingTypes?: RequiredShippingTypes;
}

export interface AdditionalFields {
    comment?: boolean;
    coupons?: boolean;
}

/**
 * Информация об ошибках мерча
 */

export interface MerchantErrors {
    code: string;
    message: string;
}

export enum UpdateErrorCode {
    // Ошибка в валидации купона.
    Coupon = 'COUPON',
}

/**
 * Информация от мерчанта
 * Обновление paymentSheet
 */

export type ShippingProvider = 'YANDEX' | 'COURIER' | 'CDEK' | 'EMS' | 'DHL' | 'RUSSIAN_POST';

export type ShippingCategory = 'express' | 'today' | 'standart';

export type PickupProvider = 'pickpoint';

// Вариант доставки
export type ShippingOptionId = string;

export interface ShippingOption {
    id: ShippingOptionId;
    provider: ShippingProvider;
    amount: Price;
    category?: ShippingCategory;
    date?: Date;
    time?: { from: DateTime; to: DateTime };
    label?: string;
    raw?: any;
}

export type PickupPointSchedule = {
    label: string;
    timeFrom: string;
    timeTo: string;
};

export type PickupBounds = GeoBounds;

export type PickupPointId = string;

// Точка самовывоза
export interface PickupPoint {
    id: PickupPointId;
    label: string;
    provider?: PickupProvider;
    address: AddressStr;
    deliveryDate?: Date;
    storagePeriod?: number;
    amount?: Price;
    // координаты точки самовывоза
    coordinates: GeoPoint;
    info?: {
        // расписание точки самовывоза
        schedule?: PickupPointSchedule[];
        // контакты точки самовывоза
        contacts?: ContactPhone[];
        // произвольное описание
        description?: string;
        // описание, например как добраться
        tripDescription?: string;
    };
    raw?: any;
}

export interface PickupInfo {
    pickupPointId: PickupPointId;
}

export interface SetupPaymentData {
    pickupPoints?: PickupPoint[];
}

export interface UpdatePaymentData {
    order?: Order;
    shippingOptions?: ShippingOption[];
    pickupPoints?: PickupPoint[];
    pickupPoint?: PickupPoint;
    errors?: MerchantErrors[];
    metadata?: string;
}
