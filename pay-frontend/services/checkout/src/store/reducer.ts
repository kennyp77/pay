import { createServiceReducer } from '@yandex-pay/react-services';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

import { RootState } from './state';

export const createRootReducer = (initialState: RootState, history: History) => {
    const routerReducer = connectRouter(history);

    return createServiceReducer<RootState>(initialState, (state, action) => ({
        ...state,
        router: routerReducer(state.router, action),
    }));
};
