import { EventEmitter } from '@trust/utils/event-emitter';
import { Middleware, MiddlewareAPI, AnyAction } from 'redux';

interface WaitActionHandler {
    (action?: AnyAction): void;
}

type State = any;
type WaitActionType = any;

interface WaitCondition {
    (state: State, action?: AnyAction): boolean;
}

interface WaitBase {
    (condition: WaitCondition, actionType?: WaitActionType): Promise<void>;
}

interface WaitAction {
    (actionType: WaitActionType, condition: WaitCondition): Promise<void>;
}

interface WaitState {
    (conditionFn: WaitCondition): Promise<void>;
}

interface CallSelector {
    <T = unknown>(selectorFn: (state: State) => T): T;
}

const listener = new EventEmitter();
const STATE_CHANGE_EVENT = '__state_watch__';

let middlewareApi: MiddlewareAPI;

export const waiterMiddleware: Middleware = function waiterMiddlewareFn(api) {
    middlewareApi = api;

    return (next) =>
        (action): any => {
            const result = next(action);

            listener.emit(action.type, action);
            listener.emit(STATE_CHANGE_EVENT, undefined);

            return result;
        };
};

const waitBase: WaitBase = function waitBaseFn(condition, actionType) {
    return new Promise((resolve) => {
        const { getState } = middlewareApi;
        let unsubscribe: () => void;
        const eventName = actionType || STATE_CHANGE_EVENT;

        const handleChange: WaitActionHandler = (action) => {
            if (condition(getState(), action)) {
                unsubscribe();
                resolve();
            }
        };

        unsubscribe = listener.on(eventName, handleChange);

        if (eventName === STATE_CHANGE_EVENT) {
            handleChange();
        }
    });
};

export const waitAction: WaitAction = function waitActionFn(actionType, condition) {
    return waitBase(condition, actionType);
};

export const waitState: WaitState = function waitStateFn(condition) {
    return waitBase(condition);
};

export const callSelector: CallSelector = function callSelectorFn(selectorFn) {
    const { getState } = middlewareApi;

    return selectorFn(getState());
};
