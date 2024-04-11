// Метка для RUM
/* eslint-disable import/first */
// @ts-ignore
window.__rum_boot = true;

import React from 'react';

import { securityReporter } from '@trust/dom-observable';
import { logError } from '@trust/rum';
import { createStore } from '@trust/utils/redux/store-factory';
import { render } from 'react-dom';

import App from './app';
import { ENV, REQ_ID, METRIKA_ID, METRIKA_SESSION_ID, METRIKA_CHECKOUT_ID, UID, FRAME_URL_WHITELIST } from './config';
import { init as initMetrika, counters } from './counters/metrika';
import { pingOpener } from './helpers/ping';
import { getState, getReducer } from './store';

initMetrika(METRIKA_ID, [METRIKA_SESSION_ID, METRIKA_CHECKOUT_ID], { uid: UID });

const state = getState();
const store = createStore(state, getReducer(state));

render(React.createElement(App, { store }, null), document.getElementById('root'));

window.onpageshow = (event: PageTransitionEvent): void => {
    // страница была открыта из кэша
    if (event.persisted) {
        pingOpener().catch(() => {
            counters.formLosed({ from: 'cache' });
            logError('Form losed (from cache)');
        });
    }
};

securityReporter(FRAME_URL_WHITELIST, { env: ENV, reqId: REQ_ID });
