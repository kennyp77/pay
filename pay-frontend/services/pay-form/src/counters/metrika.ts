import assign from '@tinkoff/utils/assign';
import type { MetrikaParams } from '@trust/metrika';
import * as metrika from '@trust/metrika';
import { counterWithSaving } from '@trust/utils/mix/counter';

import { CHALLENGE_NUM, EXPERIMENT } from '../config';
import { CompleteReason } from '../typings';

interface MetrikaCounter<T extends MetrikaParams = {}> {
    (params?: T): void;
}

interface CounterParams {
    uid: string;
}

type Checkout3ds = MetrikaCounter<{ state: 'start' | 'ready' | 'complete' | 'cancel' }>;

let COUNTER_PARAMS_PATH: string[] = [];

const _key = (...path: string[]): string[] => [...COUNTER_PARAMS_PATH, ...path];

const _params = (data = {}): any => assign(data, { datetime: Date.now() });

const countInc =
    (name: string, savingKey: string): MetrikaCounter =>
    (data): void => {
        metrika.counter(_key(name, `${counterWithSaving(name, 1, 1, savingKey)}`), _params(data));
    };

const count =
    (name: string): MetrikaCounter =>
    (data): void => {
        metrika.counter(_key(name), _params(data));
    };

const goal =
    (goalId: string): MetrikaCounter =>
    (data): void => {
        metrika.reachGoal(goalId, _key(goalId), _params(data));
        metrika.counter(_key(goalId), _params(data));
    };

export function init(counterId: string, counterPath: string[], counterParams: CounterParams): void {
    COUNTER_PARAMS_PATH = [...counterPath, `puid-${counterParams.uid || 0}`];

    metrika.init(counterId, {}, EXPERIMENT.experiments || '');
}

const addPaymentMethod = (
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
addPaymentMethod.key = null;

export const counters = {
    formReady: goal('pay_form_ready'),
    paymentStart: goal('payment_start'),
    paymentError: goal('payment_error'),

    formLoad: count('pay_form_load'),
    formClose: count('pay_form_close'),
    paymentCheckout: count('payment_checkout'),
    paymentMethods: count('payment_methods'),
    paymentMethodSelect: countInc('payment_method_select', 'mpsn'),

    addPaymentMethod,

    paymentComplete: count('payment_complete'),
    logout: count('auth_logout'),

    challengeRedirect: count(`challenge_redirect-${CHALLENGE_NUM + 1}`),
    immediateCheckout: count('immediate_checkout'),

    formLosed: goal('pay_form_lose'),

    bindingLoading: count('binding_loading'),
    firstBindingUserInput: count('first_binding_user_input'),
    bindingCanSubmit: count('binding_can_submit'),

    checkout3ds: <Checkout3ds>count('checkout_3ds'),
};
