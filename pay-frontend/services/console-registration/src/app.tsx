import React, { useEffect } from 'react';

import { dom } from '@trust/utils/dom';
import { configureRootTheme } from '@yandex-lego/components/Theme';
import { theme } from '@yandex-lego/components/Theme/presets/default';

import { ErrorBoundary } from './components/error-boundary';
import { LayoutContainer } from './components/layout';
import { counters } from './counters/metrika';
import './styles/index.scss';

configureRootTheme({ theme, root: document.documentElement });

export default function App(): JSX.Element {
    useEffect(() => {
        dom.on('.legouser__menu-item_action_exit', 'click', () => {
            counters.logout();
        });
    }, []);

    return (
        <ErrorBoundary>
            <LayoutContainer />
        </ErrorBoundary>
    );
}
