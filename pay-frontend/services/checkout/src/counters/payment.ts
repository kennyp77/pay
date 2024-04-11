import toLower from '@tinkoff/utils/string/toLower';
import * as metrika from '@trust/metrika';
import { counterWithSaving } from '@trust/utils/mix/counter';
import { PaymentMethodType } from '@yandex-pay/sdk/src/typings';

import { CHALLENGE_NUM } from '../config';
import { CompleteReason } from '../typings';

import { count, countInc, goal, _key, _params } from './utils';

export const addPaymentMethod = (
    state: 'init' | 'created' | 'loaded' | 'sent' | '3ds' | 'result',
    reason?: CompleteReason,
    id?: string,
): void => {
    // Обновлять счетчик мы должны только при рестарте цикла событий
    if (!addPaymentMethod.key || state === 'init') {
        addPaymentMethod.key = _key(
            `add_payment_method-${counterWithSaving('add_payment_method', 1, 1, 'mcbn')}`,
        );
    }

    const key = addPaymentMethod.key.concat(state);
    const data = state === 'result' ? { reason, id } : {};

    return metrika.counter(key, _params(data));
};
// @ts-ignore
addPaymentMethod.key = null;

const paymentStartCounter = goal('payment_start');
export const paymentStart = (amount: number | string, paymentMethodType: PaymentMethodType) => {
    paymentStartCounter({ amount, payment_method_type: toLower(paymentMethodType) });
};

export const paymentError = goal('payment_error');

export const immediateCheckout = count('immediate_checkout');
export const challengeRedirect = count(`challenge_redirect-${CHALLENGE_NUM + 1}`);

export const paymentCheckout = count('payment_checkout');
export const paymentMethods = count('payment_methods');
export const paymentMethodSelect = countInc('payment_method_select', 'mpsn');
export const paymentComplete = count('payment_complete');
