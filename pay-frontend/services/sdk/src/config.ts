import { getErrorLoggerEnv } from './helpers/validation';

declare global {
    const __PAY_HOST__: string;
    const __METRIKA_ID__: string;
    const __ERROR_LOGGER_ENV__: string;
    const __BUILD_VERSION__: string;
}

const BASE_URL = `${__PAY_HOST__}/web`;

// NB: Префикс /web добавляется webpack'ом
export const ASSETS_URL = __PAY_HOST__;

export const FORM_URL = `${BASE_URL}/form`;
export const CHECKOUT_FORM_URL = `${BASE_URL}/checkout`;
export const SDK_INIT_URL = `${BASE_URL}/sdk/v1/init`;
export const SDK_INIT_SPEEDUP_URL = `${BASE_URL}/sdk/v1/init-speedup`;
export const SDK_READY_CHECK_URL = `${BASE_URL}/sdk/v1/ready-check`;
export const SDK_PAYMENT_METHOD_URL = `${BASE_URL}/sdk/v1/payment-method`;

export const FORM_NAME = 'YandexPay';
export const FORM_SIZE = [960, 705];

export const BUTTON_CLASS = 'ya-pay-button';
export const BUTTON_LABEL = 'Yandex Pay';

export const METRIKA_URL = BASE_URL;
export const METRIKA_ID = __METRIKA_ID__;
export const BUILD_VERSION = __BUILD_VERSION__;

export const ERROR_LOGGER_URL = BASE_URL;
export const ERROR_LOGGER_ENV = getErrorLoggerEnv(__ERROR_LOGGER_ENV__);
export const ERROR_LOGGER_PAGE = 'sdk';

export enum RUM_DELTA_NAMES {
    PaymentCreate = 'payment.create',
    PaymentCreateFromSdkInit = 'payment.create.from.sdk.init',
    PaymentCreateInitDiff = 'payment.create.init.diff',
    PaymentCreateFromSdkInitSpeedup = 'payment.create.from.sdk.init.speedup',
    ButtonMountFromPaymentCreate = 'button.mount.from.payment.create',
    ButtonMountFromPaymentResolve = 'button.mount.from.payment.resolve',
    PaymentMethodsShowFromPaymentCreate = 'payment-methods.show.from.payment.create',
    PaymentMethodsShowFromButtonMount = 'payment-methods.show.from.button.mount',
}

export const PAYMENT_SHEET_META_SIZE = 128;
// now = (Date.now() * 0.001) | 0;
// rnd = (Math.random() * 1073741824) | 0;
export const YM_UID = `${(Date.now() * 0.001) | 0}${(Math.random() * 1073741824) | 0}`;
