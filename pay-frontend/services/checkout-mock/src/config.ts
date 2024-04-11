import { Experiment } from '@trust/utils/experiment';
import { createGetter } from '@trust/utils/object';
import { PaymentSheet } from '@yandex-pay/sdk/src/typings';

const configGetter = createGetter(window.__CONFIG);

export const ENV = configGetter('env', 'production');
export const REQ_ID = configGetter('reqid', '0');

export const USER_EMAIL = configGetter('userEmail', '');

export const CSRF_TOKEN = configGetter<string>('csrfToken', '');
export const PAYMENT_SHEET = configGetter<void | PaymentSheet>('paymentSheet');
export const PARENT_ORIGIN = configGetter<string>('parentOrigin', '');
export const METRIKA_SESSION_ID = configGetter<string>('metrikaSessionId', 'no-sid');
export const EXPERIMENT = configGetter<Experiment>('experiment');
export const FRAME_URL_WHITELIST = configGetter<string[]>('frameUrlWhitelist', []);

export const DIMENSIONS = {
    minWidth: 282,
    minHeight: 40,
    maxHeight: 64,
};
