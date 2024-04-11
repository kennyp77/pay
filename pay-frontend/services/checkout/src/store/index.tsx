import { History } from 'history';

import { createRootReducer } from './reducer';
import { initialState, RootState } from './state';
import { createRootStore } from './store';

export function createStore(history: History) {
    // @ts-ignore
    return createRootStore(initialState, createRootReducer(initialState, history), history);
}

export type { RootState };
