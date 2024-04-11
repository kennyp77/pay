import { Draft, produce } from 'immer';
import {
    applyMiddleware,
    compose,
    createStore as reduxCreateStore,
    MiddlewareAPI,
    PreloadedState,
    Reducer,
    StoreEnhancer,
} from 'redux';

import { ReduxAction, ReduxAnyAction, ServiceDispatch, Store } from './types';

const noopReduce: Reducer = (state) => state;

export function createStore<StateSchema>(
    externalReducer: Reducer<StateSchema, ReduxAction<StateSchema>> = noopReduce,
    preloadedState = {} as PreloadedState<StateSchema>,
    enhancers: StoreEnhancer[] = [],
): Store<StateSchema> {
    let store: Store<StateSchema>;

    function reducer<StateSchema>(state: StateSchema, action: ReduxAction<StateSchema>): StateSchema {
        if (action.__service) {
            if (action.payload) {
                state = action.payload;
            }

            return state;
        }

        // @ts-ignore
        return externalReducer?.(state, action) || state;
    }

    function middleware({ dispatch, getState }: MiddlewareAPI) {
        return (next: ServiceDispatch<StateSchema>) => {
            return (action: ReduxAnyAction<StateSchema, StateSchema>): unknown => {
                if (typeof action === 'function' && action.__service) {
                    function setState(recipe: (draft: Draft<StateSchema>) => StateSchema, type = 'setState'): void {
                        const payload = produce(getState(), recipe);

                        store.dispatch({ type: `${type} setState`, payload, __service: true });
                    }

                    function logService(type: string, input: unknown): void {
                        store.dispatch({ type: `${type} call`, input, __service: true });
                    }

                    return action({
                        dispatch,
                        getState,
                        setState,
                        logService,
                        subscribe: store.subscribe,
                    });
                }

                return next(action);
            };
        };
    }

    const enhancersToCompose = [applyMiddleware(middleware), ...enhancers];
    let enhancer = compose(...enhancersToCompose) as StoreEnhancer;

    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
        const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
            compose;

        enhancer = composeEnhancers(enhancer);
    }

    store = reduxCreateStore<StateSchema, ReduxAction<StateSchema>, {}, {}>(
        // @ts-ignore
        reducer,
        preloadedState,
        enhancer,
    );

    return store;
}
