import {
    Action,
    Reducer,
    PreloadedState,
    Store,
    compose,
    createStore as baseCreateStore,
    applyMiddleware,
} from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import { waiterMiddleware } from './redux-watcher';

export function createStore<S>(state: PreloadedState<S>, reducer: Reducer<S>): Store<S> {
    const composeMiddleware = __DEV__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose : compose;

    const middlewares = [thunk as ThunkMiddleware<S>, waiterMiddleware];

    if (__DEV__) {
        const logger = createLogger({
            collapsed: true,
            diff: true,
            duration: true,
        });

        middlewares.push(logger);
    }

    return baseCreateStore<S, Action, {}, {}>(reducer, state, composeMiddleware(applyMiddleware(...middlewares)));
}
