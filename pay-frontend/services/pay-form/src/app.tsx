import React from 'react';

import Page from '@trust/ui/components/page';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { THEME, TEMPLATE, THEME_SETTINGS } from './config';
import ErrorBoundary from './containers/error-boundary';
import Payment from './containers/payment';
import { State } from './store';

interface AppProps {
    store: Store<State>;
}

export default function App({ store }: AppProps): JSX.Element {
    return (
        <ErrorBoundary>
            <Provider store={store}>
                <Page template={TEMPLATE} theme={THEME} themeSettings={THEME_SETTINGS}>
                    <Payment />
                </Page>
            </Provider>
        </ErrorBoundary>
    );
}
