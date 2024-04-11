interface TypedObject<T> {
    type: T;
}

export enum CardNetwork {
    Maestro = 'MAESTRO',
    Mastercard = 'MASTERCARD',
    Mir = 'MIR',
    Visa = 'VISA',
}

export enum PayButtonType {
    Simple = 'SIMPLE',
    Pay = 'PAY',
    PayUser = 'USER',
    PayCard = 'CARD',
    PayUserCard = 'USER_AND_CARD',
    Checkout = 'CHECKOUT',
    CheckoutUser = 'CHECKOUT_USER',
    CheckoutSplit = 'CHECKOUT_SPLIT',
    CheckoutSplitUser = 'CHECKOUT_SPLIT_USER',
}

export enum SdkPaymentMethodEventType {
    Ready = 'READY',
    Failure = 'FAILURE',
}

export type SdkPaymentMethodReadyEvent = TypedObject<SdkPaymentMethodEventType.Ready> & {
    buttonType: PayButtonType;
};

export type SdkPaymentMethodFailureEvent = TypedObject<SdkPaymentMethodEventType.Failure>;

export type SdkPaymentMethodEvent = SdkPaymentMethodReadyEvent | SdkPaymentMethodFailureEvent;

export enum SdkPaymentMethodMessageType {
    Update = 'UPDATE',
}

export type SdkPaymentMethodUpdateMessage = TypedObject<SdkPaymentMethodMessageType.Update> & {
    paymentSheet: any;
};

export type SdkPaymentMethodMessage = SdkPaymentMethodUpdateMessage;
