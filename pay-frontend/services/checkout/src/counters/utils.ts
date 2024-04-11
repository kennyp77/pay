import assign from '@tinkoff/utils/assign';
import type { MetrikaParams } from '@trust/metrika';
import * as metrika from '@trust/metrika';
import { counterWithSaving } from '@trust/utils/mix/counter';

import { EXPERIMENT } from '../config';

export interface MetrikaCounter<T extends MetrikaParams = {}> {
    (params?: T): void;
}

interface CounterParams {
    uid: string;
}

let COUNTER_PARAMS_PATH: string[] = [];

export const _key = (...path: string[]): string[] => [...COUNTER_PARAMS_PATH, ...path];

export const _params = (data = {}): any => assign(data, { datetime: Date.now() });

export const countInc =
    (name: string, savingKey: string): MetrikaCounter =>
    (data): void => {
        metrika.counter(_key(name, `${counterWithSaving(name, 1, 1, savingKey)}`), _params(data));
    };

export const count =
    (name: string): MetrikaCounter =>
    (data): void => {
        metrika.counter(_key(name), _params(data));
    };

export const goal =
    (goalId: string): MetrikaCounter =>
    (data): void => {
        metrika.reachGoal(goalId, _key(goalId), _params(data));
        metrika.counter(_key(goalId), _params(data));
    };

export function init(counterId: string, counterPath: string[], counterParams: CounterParams): void {
    COUNTER_PARAMS_PATH = [...counterPath, `puid-${counterParams.uid || 0}`];

    metrika.init(counterId, {}, EXPERIMENT.experiments || '');
}
