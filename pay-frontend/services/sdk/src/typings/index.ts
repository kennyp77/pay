import { ButtonType, ButtonTheme, ButtonWidth, ButtonEventType } from './button';
import {
    Payment,
    CheckoutPayment,
    PaymentEventType,
    AbortEventReason,
    ErrorEventReason,
    MessageType,
    CompleteReason,
} from './payment';
import {
    PaymentDataV3,
    InitPaymentData,
    Merchant,
    PaymentMethod,
    PaymentEnv,
    CountryCode,
    CurrencyCode,
    OrderItemType,
    PaymentMethodType,
    AllowedAuthMethod,
    AllowedCardNetwork,
} from './sheet';
import { UpdateErrorCode } from './sheet-checkout';

export * from './button';
export * from './sheet';
export * from './sheet-checkout';
export * from './payment';

/**
 * Фабрика создающая платеж
 */

export interface SdkAgent {
    name: string;
    version: string;
}

export interface CreateOptions {
    agent?: SdkAgent;
}

export interface CreatePayment {
    /**
     * @reject PaymentError
     */
    (paymentData: InitPaymentData | PaymentDataV3, options?: CreateOptions): Promise<Payment>;
}

export interface CreateCheckout {
    /**
     * @reject PaymentError
     */
    (paymentData: PaymentDataV3, options?: CreateOptions): Promise<CheckoutPayment>;
}

/**
 * Проверка пользователя для быстрого платежа
 */

export interface ReadyToPayCheckOptions {
    /**
     * @default PaymentEnv.PRODUCTION
     */
    env?: PaymentEnv;

    merchantId: Merchant['id'];

    paymentMethods?: PaymentMethod[];

    /**
     * @default false
     */
    checkActiveCard?: boolean;
}

export interface ReadyToPayCheck {
    (options: ReadyToPayCheckOptions): Promise<boolean>;
}

interface RobokassaSdkMethods {
    getTabIcon: () => Promise<string>;
}

export interface YaPay {
    createPayment: CreatePayment;
    createCheckout: CreateCheckout;
    readyToPayCheck: ReadyToPayCheck;

    /**
     * Enums
     */

    /**
     * Общие типы.
     */
    PaymentEnv: PaymentEnv;
    CountryCode: CountryCode;
    CurrencyCode: CurrencyCode;
    OrderItemType: OrderItemType;

    /**
     * Описание методов оплаты.
     */
    PaymentMethodType: PaymentMethodType;
    AllowedAuthMethod: AllowedAuthMethod;
    AllowedCardNetwork: AllowedCardNetwork;

    /**
     * События формы.
     */
    PaymentEventType: PaymentEventType;
    AbortEventReason: AbortEventReason;
    ErrorEventReason: Record<string, ErrorEventReason>;

    /**
     * Сообщения SDK.
     */
    MessageType: MessageType;
    CompleteReason: CompleteReason;
    UpdateErrorCode: UpdateErrorCode;

    /**
     * Настройки платёжной кнопки.
     */
    ButtonType: ButtonType;
    ButtonTheme: ButtonTheme;
    ButtonWidth: ButtonWidth;

    /**
     * События платёжной кнопки.
     */
    ButtonEventType: ButtonEventType;

    /**
     * Методы для Робокассы
     */
    // TODO: Вынести из общей sdk
    Robokassa: RobokassaSdkMethods;
}
