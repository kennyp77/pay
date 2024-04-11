import { createServiceMiddleware, createServiceReducer } from '@yandex-pay/react-services';
import { Action, applyMiddleware, compose, createStore, Middleware, Store } from 'redux';
import { createLogger } from 'redux-logger';

import { stateToQuery } from '../utils/query';

import { initialState, State } from './state';

export function configureStore(initialState?: State): Store<State> {
    const composeMiddleware = __DEV__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
        : compose;

    const middlewares: Middleware[] = [createServiceMiddleware<State>()];

    if (__DEV__) {
        const logger = createLogger({
            collapsed: true,
            diff: true,
            duration: true,
        });

        middlewares.push(logger);
    }

    return createStore<State, Action, {}, {}>(
        // @ts-ignore
        createServiceReducer<State>(initialState),
        initialState,
        composeMiddleware(applyMiddleware(...middlewares)),
    );
}

export const store = configureStore(initialState);

store.subscribe(() => {
    const state = store.getState();

    history.replaceState(
        null,
        document.title,
        window.location.pathname + '?' + stateToQuery(state.options),
    );
});
