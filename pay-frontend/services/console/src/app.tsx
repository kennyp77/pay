import React from 'react';

import { configureRootTheme } from '@yandex-lego/components/Theme';
import { theme } from '@yandex-lego/components/Theme/presets/default';

import { ErrorBoundary } from './components/error-boundary';
import { LayoutContainer } from './components/layout';
import './styles/index.scss';

configureRootTheme({ theme, root: document.documentElement });

export default function App(): JSX.Element {
    return (
        <ErrorBoundary>
            <LayoutContainer />
        </ErrorBoundary>
    );
}
