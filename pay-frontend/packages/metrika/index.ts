import toArray from '@tinkoff/utils/array/toArray';
import isFunction from '@tinkoff/utils/is/function';
import isString from '@tinkoff/utils/is/string';
import pathSet from '@tinkoff/utils/object/pathSet';
import { logError } from '@trust/rum';
import { debug } from '@trust/utils/debug';

import requestCounter from './counter-code';

requestCounter();

export type MetrikaCounterId = number | string;
export type MetrikaParamsName = string | string[];
export type MetrikaParams = Record<string, any>;
export type MetrikaExperiments = string;

interface MetrikaFn {
    (cid: MetrikaCounterId, method: string, ...args: any[]): void;
}

declare global {
    interface Window {
        ym: MetrikaFn;
        yandex_metrika_callbacks2?: any[];
    }
}

let COUNTER_ID: MetrikaCounterId = 0;

const YM = 'ym';
const YM_QUEUE = 'yandex_metrika_callbacks2';

window[YM_QUEUE] = window[YM_QUEUE] || [];

function _send(method: string, ...args: any[]): void {
    if (!COUNTER_ID) {
        debug(`[Metrika] Skip call '${method}' with params`, args);

        return;
    }

    if (!window[YM]) {
        window[YM_QUEUE].push(() => _send(method, ...args));

        return;
    }

    try {
        window[YM](COUNTER_ID, method, ...args);
    } catch (err) {
        logError(err, { type: 'ym_error' });
    }
}

export function init(counterId: MetrikaCounterId, params: MetrikaParams, experiments: MetrikaExperiments): void {
    COUNTER_ID = counterId;

    _send('init', { params });
    _send('experiments', experiments);
}

export function counter(name: MetrikaParamsName, extParams: MetrikaParams = {}): void {
    const params = pathSet(toArray(name), extParams, {});

    if (!COUNTER_ID) {
        debug('[Metrika] No counter. Skipping count', params);

        return;
    }

    _send('params', params);
}

function reachGoal(goalId: string): void;
function reachGoal(goalId: string, params: MetrikaParams): void;
function reachGoal(goalId: string, callback: Sys.CallbackFn0): void;
function reachGoal(goalId: string, name: MetrikaParamsName, params: MetrikaParams): void;
function reachGoal(goalId: string, params: MetrikaParams, callback: Sys.CallbackFn0): void;
// eslint-disable-next-line max-len
function reachGoal(goalId: string, name: MetrikaParamsName, params: MetrikaParams, callback: Sys.CallbackFn0): void;

function reachGoal(
    goalId: string,
    name?: MetrikaParamsName | MetrikaParams | Sys.CallbackFn0,
    extParams?: MetrikaParams | Sys.CallbackFn0,
    callback?: Sys.CallbackFn0,
): void {
    /* eslint-disable no-param-reassign */
    callback = isFunction(name) ? name : callback;
    name = isString(name) ? name : '';

    callback = isFunction(extParams) ? extParams : callback;
    extParams = isFunction(extParams) ? {} : extParams;
    /* eslint-enable no-param-reassign */

    const params = name ? pathSet(toArray(name), extParams, {}) : extParams;

    if (!COUNTER_ID) {
        debug(`[Metrika] No counter. Skipping goal '${goalId}' with params`, params);

        return;
    }

    _send('reachGoal', goalId, params, callback);
}

export { reachGoal };
