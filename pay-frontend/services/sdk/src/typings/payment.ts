/* eslint-disable max-classes-per-file */
/* eslint-disable no-dupe-class-members */

import { Experiment } from '@trust/utils/experiment';

import { ButtonOptions, Button, ButtonParent } from './button';
import { Listener, UnsubscribeCallback, TypedObject } from './common';
import {
    PaymentToken,
    PaymentMethodInfo,
    Price,
    InitPaymentSheet,
    UpdatePaymentDataV3,
} from './sheet';
import {
    Coupon,
    ShippingAddress,
    ShippingOption,
    PickupBounds,
    GeoBounds,
    GeoPoint,
    PickupPoint,
    PickupInfo,
    BillingContactInfo,
    ShippingContactInfo,
    ShippingMethodInfo,
    AdditionalInfo,
    SetupPaymentData,
    UpdatePaymentData,
} from './sheet-checkout';

/**
 * События формы.
 */

export enum PaymentEventType {
    Ready = 'ready',
    Abort = 'abort',
    Error = 'error',
    Process = 'process',
    Ping = 'ping',
    Change = 'change',
    Reset = 'reset',
    Setup = 'setup',
    Success = 'success',
}

export type ReadyEvent = TypedObject<PaymentEventType.Ready>;

export type PingEvent = TypedObject<PaymentEventType.Ping>;

export enum AbortEventReason {
    /**
     * Покупатель закрыл форму оплаты.
     */
    Close = 'CLOSE',

    /**
     * Покупатель не успел совершить оплату.
     */
    Timeout = 'TIMEOUT',
}

export type ErrorEventReason = string;

export interface AbortEvent extends TypedObject<PaymentEventType.Abort> {
    reason?: AbortEventReason;
}

export interface ErrorEvent extends TypedObject<PaymentEventType.Error> {
    reason?: ErrorEventReason;
    details?: any;
}

export interface ChangeEvent extends TypedObject<PaymentEventType.Change> {
    coupon?: Coupon;
    shippingAddress?: ShippingAddress;
    shippingOption?: ShippingOption;
    pickupBounds?: PickupBounds;
    pickupArea?: {
        bounds: GeoBounds;
        center: GeoPoint;
    };
    pickupPoint?: PickupPoint;
    pickupInfo?: PickupInfo;
}

export interface ResetEvent extends TypedObject<PaymentEventType.Reset> {
    coupon?: boolean;
    shippingAddress?: boolean;
    shippingOption?: boolean;
    pickupBounds?: boolean;
    pickupPoint?: boolean;
}

export interface SetupEvent extends TypedObject<PaymentEventType.Setup> {
    pickupPoints?: boolean;
}

export interface ProcessEvent extends TypedObject<PaymentEventType.Process> {
    token: PaymentToken;
    paymentMethodInfo: PaymentMethodInfo;
    orderAmount: Price;
    billingContact?: BillingContactInfo;
    shippingContact?: ShippingContactInfo;
    shippingMethodInfo?: ShippingMethodInfo;
    additionalInfo?: AdditionalInfo;
}

export interface SuccessEvent extends TypedObject<PaymentEventType.Success> {
    orderId: string;
    metadata?: string;
}

export type PaymentEvent =
    | ReadyEvent
    | PingEvent
    | AbortEvent
    | ErrorEvent
    | ChangeEvent
    | ResetEvent
    | SetupEvent
    | ProcessEvent
    | SuccessEvent;

/**
 * Внутренние события формы
 */

export enum InnerEventType {
    SdkReady = 'sdk-ready',
    SdkExp = 'sdk-exp',
    SdkReadyExp = 'sdk-ready-exp',
    SdkPing = 'sdk-ping',
    // TODO: Вынести в отдельный enum
    SdkReadyCheck = 'sdk-ready-check',
    PaymentUpdate = 'payment-update',
}

export type PaymentUpdateEvent = TypedObject<InnerEventType.PaymentUpdate>;

export interface SdkReadyEvent extends TypedObject<InnerEventType.SdkReady> {
    readyToPay: boolean;
    isWebview?: boolean;
}

export interface SdkReadyExpEvent extends TypedObject<InnerEventType.SdkReadyExp> {
    readyToPay: boolean;
    isWebview?: boolean;
    experiment: Experiment;
}

export interface SdkExperimentsEvent extends TypedObject<InnerEventType.SdkExp>, Experiment {}

export interface SdkReadyCheckEvent extends TypedObject<InnerEventType.SdkReadyCheck> {
    readyToPay: boolean;
    isWebview?: boolean;
}

export type InnerEvent = SdkReadyEvent | SdkExperimentsEvent | SdkReadyExpEvent;

/**
 * Сообщения SDK.
 */

export enum MessageType {
    Setup = 'setup',
    Payment = 'payment',
    Update = 'update',
    Complete = 'complete',
    Ping = 'ping',
}

export interface PaymentMessage extends TypedObject<MessageType.Payment> {
    sheet: InitPaymentSheet;
}

export enum CompleteReason {
    Success = 'success',
    // Fail => Error
    Error = 'error',
    Close = 'close',
    AuthRedirect = 'auth-redirect',
}

export interface CompleteMessage extends TypedObject<MessageType.Complete> {
    reason: CompleteReason;
    errors?: any;
}

export interface SetupMessage extends TypedObject<MessageType.Setup> {
    setupData: SetupPaymentData;
}

export interface UpdateMessage extends TypedObject<MessageType.Update> {
    updateData: UpdatePaymentData;
}

export type PingMessage = TypedObject<MessageType.Ping>;

export type Message = PaymentMessage | CompleteMessage | PingMessage | UpdateMessage | SetupMessage;

/**
 * Конструктор платежа.
 */

export declare class Payment {
    /**
     * Создаёт привязанный к платежу экземпляр кнопки.
     * @deprecated
     */
    createButton(options: ButtonOptions): Button;

    /**
     * Создаёт привязанный к платежу экземпляр кнопки.
     */
    mountButton(parent: ButtonParent, options: ButtonOptions): void;

    /**
     * Добавляет init-данные платежа.
     */
    setup(setupData: SetupPaymentData): void;

    /**
     * Обноваляет данные платежа.
     */
    update(updateData: UpdatePaymentData): void;

    /**
     * Запускает процесс оплаты.
     */
    checkout(): void;

    /**
     * Удаляет платеж и все связанные с ним данные
     */
    destroy(): void;

    /**
     * Подписывает на события формы платежа.
     */

    /**
     * Форма оплаты загрузилась.
     */
    on(type: PaymentEventType.Ready, listener: Listener<ReadyEvent>): UnsubscribeCallback;

    /**
     * Форма оплаты проверяет доступность sdk.
     */
    on(type: PaymentEventType.Ping, listener: Listener<PingEvent>): UnsubscribeCallback;

    /**
     * Оплата была отменена, например пользователь закрыл форму.
     */
    on(type: PaymentEventType.Abort, listener: Listener<AbortEvent>): UnsubscribeCallback;

    /**
     * Произошла ошибка во время оплаты.
     */
    on(type: PaymentEventType.Error, listener: Listener<ErrorEvent>): UnsubscribeCallback;

    /**
     * Заказ успешно оплачен
     * Вместе с событием возвращаются id заказа и статус платежа.
     */
    on(type: PaymentEventType.Success, listener: Listener<SuccessEvent>): UnsubscribeCallback;

    /**
     * Запустился процесс оплаты.
     * Вместе с событием возвращается платёжный токен.
     */
    on(type: PaymentEventType.Process, listener: Listener<ProcessEvent>): UnsubscribeCallback;

    /**
     * Изменился изменилась форма.
     */
    on(type: PaymentEventType.Change, listener: Listener<ChangeEvent>): UnsubscribeCallback;

    /**
     * Сброс параметра формы (пока что только shippingOption).
     */
    on(type: PaymentEventType.Reset, listener: Listener<ResetEvent>): UnsubscribeCallback;

    /**
     * Инициализация параметра формы (пока что только pickupPoints).
     */
    on(type: PaymentEventType.Setup, listener: Listener<SetupEvent>): UnsubscribeCallback;

    /**
     * Дополнительное управление состоянием формы оплаты.
     */

    /**
     * Сообщить форме об успешной оплате.
     */
    complete(reason: CompleteReason.Success): void;

    /**
     * Сообщить форме об ошибке оплаты.
     */
    complete(reason: CompleteReason.Error, errors: unknown): void;

    /**
     * Закрыть платёжную форму.
     */
    complete(reason: CompleteReason.Close): void;

    /**
     * Сообщить форме о редиректе покупателя на стороннюю форму оплаты.
     */
    complete(reason: CompleteReason.AuthRedirect): void;
}

/**
 * Конструктор checkout-платежа.
 */

export declare class CheckoutPayment {
    /**
     * Создаёт привязанный к платежу экземпляр кнопки.
     */
    mountButton(parent: ButtonParent, options: ButtonOptions): void;

    /**
     * Обноваляет данные платежа.
     */
    update(updateData: UpdatePaymentDataV3): void;

    /**
     * Удаляет платеж и все связанные с ним данные
     */
    destroy(): void;

    /**
     * Подписывает на события формы платежа.
     */

    /**
     * Форма оплаты загрузилась.
     */
    on(type: PaymentEventType.Ready, listener: Listener<ReadyEvent>): UnsubscribeCallback;

    /**
     * Оплата была отменена, например пользователь закрыл форму.
     */
    on(type: PaymentEventType.Abort, listener: Listener<AbortEvent>): UnsubscribeCallback;

    /**
     * Произошла ошибка во время оплаты.
     */
    on(type: PaymentEventType.Error, listener: Listener<ErrorEvent>): UnsubscribeCallback;

    /**
     * Заказ успешно оплачен
     * Вместе с событием возвращаются id заказа и статус платежа.
     */
    on(type: PaymentEventType.Success, listener: Listener<SuccessEvent>): UnsubscribeCallback;

    /**
     * Дополнительное управление состоянием формы оплаты.
     */

    /**
     * Сообщить форме об успешной оплате.
     */
    complete(reason: CompleteReason.Success): void;

    /**
     * Сообщить форме об ошибке оплаты.
     */
    complete(reason: CompleteReason.Error, errors: unknown): void;

    /**
     * Закрыть платёжную форму.
     */
    complete(reason: CompleteReason.Close): void;

    /**
     * Сообщить форме о редиректе покупателя на стороннюю форму оплаты.
     */
    complete(reason: CompleteReason.AuthRedirect): void;
}

/**
 * Ошибка создания платежа
 */

export type PaymentError = Error;
