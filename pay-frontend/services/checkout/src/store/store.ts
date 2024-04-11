import { createServiceMiddleware } from '@yandex-pay/react-services';
import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import {
    Action,
    Reducer,
    Middleware,
    PreloadedState,
    Store,
    compose,
    createStore,
    applyMiddleware,
} from 'redux';

import { RootState } from './state';

export const createRootStore = <S = RootState>(
    initialState: PreloadedState<S>,
    reducer: Reducer<S>,
    history: History,
): Store<S> => {
    const composeMiddleware = __DEV__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
        : compose;

    const middlewares: Middleware[] = [routerMiddleware(history), createServiceMiddleware<S>()];

    if (__DEV__) {
        const { createLogger } = require(`redux-logger`);

        const logger = createLogger({
            level: 'debug',
            collapsed: true,
            diff: true,
            duration: true,
            titleFormatter(action: any, _: string, took: number) {
                return [
                    `%c${action.type} %c(in ${took.toFixed(2)} ms)`,
                    'color: inherit; font-weight: bold;',
                    'color: gray; font-weight: lighter;',
                ];
            },
            logger: {
                ...console,
                groupCollapsed([...args]) {
                    return console.groupCollapsed(...args);
                },
            },
        });

        middlewares.push(logger);
    }

    return createStore<S, Action, {}, {}>(
        reducer,
        initialState,
        composeMiddleware(applyMiddleware(...middlewares)),
    );
};
