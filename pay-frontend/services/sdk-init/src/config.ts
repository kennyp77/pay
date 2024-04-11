import { createGetter } from '@trust/utils/object';
import { PaymentData } from '@yandex-pay/sdk/src/typings';

const configGetter = createGetter(window);

export const PAYMENT_DATA = configGetter<PaymentData>('paymentData');
export const PARENT_ORIGIN = configGetter<string>('parentOrigin', '');
export const IS_READY_TO_PAY = configGetter('isReadyToPay', false);
export const FRAME_URL_WHITELIST = configGetter<string[]>('frameUrlWhitelist', []);
