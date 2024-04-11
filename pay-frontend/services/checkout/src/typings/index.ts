export * from './sdk-stub';

export enum AppScreen {
    Main,
    Order,
    BindCard,
    PaymentMethods,
    Success,

    ObAddressSelect,
    ObAddressAdd,
    ObAddressEdit,

    AddressSelect,
    AddressAdd,
    AddressEdit,

    ObContactSelect,
    ObContactAdd,
    ObContactEdit,

    ContactSelect,
    ContactAdd,
    ContactEdit,

    ObPickup,

    Pickup,
}

export enum AppPendingReason {
    SheetLoading = 'PAYMENT_SHEET_LOADING',
    PaymentMethodsLoading = 'PAYMENT_METHODS_LOADING',
    CardBindingFormLoading = 'CARD_BINDING_FORM_LOADING',
    CardBinding = 'CARD_BINDING',
    CardAuthorizing = 'CARD_AUTHORIZING',
    SplitFormLoading = 'SPLIT_FORM_LOADING',
    Checkout = 'CHECKOUT',
    CheckoutProcess = 'CHECKOUT_PROCESS',
    ChallengeRequired = 'CHALLENGE_REQUIRED',
    AddressDelete = 'ADDRESS_DELETE',
    ContactDelete = 'CONTACT_DELETE',
}

export interface AppPending {
    reason: AppPendingReason;
    message?: string;
    description?: string;
}

export enum AppErrorReason {
    PaymentSheetLoadingError = 'PAYMENT_SHEET_LOADING',
    PaymentSheetValidatingError = 'PAYMENT_SHEET_VALIDATING_ERROR',
    PaymentMethodsLoadingError = 'PAYMENT_METHODS_LOADING_ERROR',
    CheckoutError = 'CHECKOUT_ERROR',
    RemoveLastContactError = 'REMOVE_LAST_CONTACT_ERROR',
}

export interface AppError {
    reason: AppErrorReason | string;
    message?: string;
    description?: string;
    action?: Sys.CallbackFn0;
    actionText?: string;
    useActionButton?: boolean;
}

export enum CompleteReason {
    Success = 'success',
    Error = 'error',
    Close = 'close',
    Timeout = 'timeout',
}
