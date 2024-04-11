import { Draft, produce } from 'immer';
import { Middleware } from 'redux';

import { SERVICE_ACTION, SERVICE_TRIGGER } from './constants';
import { ReduxAnyAction } from './typings';

export function createServiceMiddleware<StateSchema>(): Middleware<{}, StateSchema> {
    return function serviceMiddleware({ dispatch, getState }) {
        return (next) => {
            return (action: ReduxAnyAction<StateSchema>): unknown => {
                function setState(payload: StateSchema) {
                    const type = __DEV__
                        ? action.type.replace(SERVICE_TRIGGER, SERVICE_ACTION)
                        : SERVICE_ACTION;

                    return dispatch({ type, payload });
                }

                if ((action.type as string).startsWith(SERVICE_TRIGGER) && action.payloadFn) {
                    dispatch({ type: action.type });

                    return action.payloadFn({
                        dispatch,
                        getState,
                        setState,
                        produce(
                            recipe: (state: Draft<StateSchema>) => StateSchema | void | undefined,
                        ) {
                            return setState(produce<StateSchema>(recipe)(getState()));
                        },
                    });
                }

                return next(action);
            };
        };
    };
}
