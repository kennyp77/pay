export enum AppScreen {
    Order = 'ORDER',
    BindCard = 'BIND_CARD',
    PaymentMethods = 'PAYMENT_METHODS',
    Success = 'SUCCESS',
    Checkout3ds = 'CHECKOUT_3DS',
    CheckoutServerSuccess = 'CHECKOUT_SERVER_SUCCESS',

    // Errors
    PaymentSheetLoadingError = 'PAYMENT_SHEET_LOADING',
    PaymentSheetValidatingError = 'PAYMENT_SHEET_VALIDATING_ERROR',
    PaymentMethodsLoadingError = 'PAYMENT_METHODS_LOADING_ERROR',
    InitializationError = 'INITIALIZATION_ERROR',
    CheckoutError = 'CHECKOUT_ERROR',
}

export enum AppPending {
    PaymentSheetLoading = 'PAYMENT_SHEET_LOADING',
    PaymentMethodsLoading = 'PAYMENT_METHODS_LOADING',
    CardBindingFormLoading = 'CARD_BINDING_FORM_LOADING',
    CardBinding = 'CARD_BINDING',
    Checkout = 'CHECKOUT',
    ChallengeRequired = 'CHALLENGE_REQUIRED',
    Checkout3ds = 'CHECKOUT_3DS',
}

export enum CompleteReason {
    Success = 'success',
    Error = 'error',
    Close = 'close',
}

export interface AppAuth3ds {
    method: 'IFRAME';
    url: string;
}
