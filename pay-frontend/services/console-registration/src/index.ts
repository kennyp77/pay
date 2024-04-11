// Метка для RUM
/* eslint-disable import/first */
// @ts-ignore
window.__rum_boot = true;

import React from 'react';

import { render } from 'react-dom';

import App from './app';
import { METRIKA_ID, UID } from './config';
import { init as initMetrika } from './counters/metrika';

initMetrika(METRIKA_ID, { uid: UID });

render(React.createElement(App), document.getElementById('root'));
