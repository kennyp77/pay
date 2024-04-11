import React from 'react';

import { configureRootTheme } from '@yandex-lego/components/Theme';
import { theme } from '@yandex-lego/components/Theme/presets/default';
import { render } from 'react-dom';

import App from './app';

configureRootTheme({ theme });

render(React.createElement(App, null), document.getElementById('root'));
