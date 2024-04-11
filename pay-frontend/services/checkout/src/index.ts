// Метка для RUM
/* eslint-disable import/first */
// @ts-ignore
window.__rum_boot = true;

import React from 'react';

import { securityReporter } from '@trust/dom-observable';
import { logError } from '@trust/rum';
import { render } from 'react-dom';

import App from './app';
import {
    ENV,
    REQ_ID,
    METRIKA_ID,
    METRIKA_SESSION_ID,
    METRIKA_CHECKOUT_ID,
    UID,
    FRAME_URL_WHITELIST,
} from './config';
import { counters } from './counters';
import { isTouchTemplate } from './helpers/app';
import { pingOpener } from './helpers/ping';
import * as routesDesktop from './router/routes@desktop';
import * as routesTouch from './router/routes@touch';

counters.init(METRIKA_ID, [METRIKA_SESSION_ID, METRIKA_CHECKOUT_ID], { uid: UID });

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

const isTouch = isTouchTemplate();
const routes = isTouch ? routesTouch : routesDesktop;

render(
    React.createElement(App, { ...routes, touch: isTouch }, null),
    document.getElementById('root'),
);
