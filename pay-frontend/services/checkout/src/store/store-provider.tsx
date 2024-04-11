import React from 'react';

import { ConnectedRouter, ConnectedRouterProps } from 'connected-react-router';
import { Provider } from 'react-redux';
import { Store as ReduxStore } from 'redux';

import { RootState } from './state';

type StoreProviderProps = ConnectedRouterProps & {
    store: ReduxStore<RootState>;
    children: any;
};

export const StoreProvider: React.FC<StoreProviderProps> = ({ store, history, children }) => {
    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>{children}</ConnectedRouter>
        </Provider>
    );
};
