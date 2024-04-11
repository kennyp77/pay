import { init as errorLoggerInit } from '@trust/rum/light/config';
import { sendVersion as sendVersionToRum } from '@trust/rum/light/version-logger';

import { getExperiment } from './abt';
import {
    METRIKA_ID,
    METRIKA_URL,
    ERROR_LOGGER_URL,
    ERROR_LOGGER_ENV,
    ERROR_LOGGER_PAGE,
    YM_UID,
    BUILD_VERSION,
} from './config';
import { createCheckout } from './create-checkout';
import { createPayment } from './create-payment';
import { DeprecatedButton } from './deprecated/button';
import { deprecatedErrorEventReasonMap } from './deprecated/error-event-reason-map';
import { init, setExperiments } from './metrika';
import { readyToPayCheck } from './ready-to-pay-check';
import { Robokassa } from './sdk-robokassa';
import {
    YaPay,
    PaymentEnv,
    CountryCode,
    CurrencyCode,
    PaymentMethodType,
    OrderItemType,
    UpdateErrorCode,
    AllowedAuthMethod,
    AllowedCardNetwork,
    PaymentEventType,
    AbortEventReason,
    MessageType,
    CompleteReason,
    ButtonType,
    ButtonTheme,
    ButtonWidth,
    ButtonEventType,
} from './typings';

errorLoggerInit(ERROR_LOGGER_URL, ERROR_LOGGER_ENV, ERROR_LOGGER_PAGE, BUILD_VERSION);
sendVersionToRum();
init(METRIKA_ID, METRIKA_URL, YM_UID);

getExperiment.then(({ experiments }) => setExperiments(experiments || ''));

window.YaPay = {
    createPayment,
    createCheckout,
    readyToPayCheck,
    Robokassa,

    /** @deprecated */
    Button: DeprecatedButton,

    /**
     * Enums
     */
    Env: PaymentEnv,
    PaymentEnv,
    CountryCode,
    CurrencyCode,
    PaymentMethodType,
    OrderItemType,
    AllowedAuthMethod,
    AllowedCardNetwork,
    CheckoutEventType: PaymentEventType,
    PaymentEventType,
    AbortEventReason,
    ErrorEventReason: deprecatedErrorEventReasonMap(),
    UpdateErrorCode,
    MessageType,
    CompleteReason,
    ButtonType,
    ButtonTheme,
    ButtonWidth,
    ButtonEventType,
} as unknown as YaPay;
