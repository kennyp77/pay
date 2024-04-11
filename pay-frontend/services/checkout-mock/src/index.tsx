import React from 'react';

import { render } from 'react-dom';

import { App } from './components/app';
import { StoreContextProvider } from './store';

render(
    <StoreContextProvider>
        <App />
    </StoreContextProvider>,
    document.getElementById('root'),
);
