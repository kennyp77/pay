import React from 'react';

import { dom } from '@trust/utils/dom';
import { configureRootTheme } from '@yandex-lego/components/Theme';
import { theme } from '@yandex-lego/components/Theme/presets/default';

import { AppInit } from './features/app';
import { Payment } from './features/checkout';
import { InfoScreens } from './features/info';
import { MapWrapper } from './features/map/wrapper';
import { history, Router } from './router';
import { createStore } from './store';
import { StoreProvider } from './store/store-provider';
import './styles/index.scss';

configureRootTheme({ theme, root: document.documentElement });

dom.remove('.init-preloader');

const store = createStore(history);

interface AppProps {
    touch: boolean;
    routes: Checkout.Routes;
    obRoutes: Checkout.Routes;
}

export default function App({ routes, obRoutes, touch }: AppProps) {
    return (
        <StoreProvider store={store} history={history}>
            <AppInit>
                <InfoScreens />
                <Payment touch={touch} />
                <Router routes={routes} obRoutes={obRoutes} />
            </AppInit>

            <MapWrapper />
        </StoreProvider>
    );
}
