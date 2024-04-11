import React, { useEffect } from 'react';

import { cn } from '@bem-react/classname';
import { dom } from '@trust/utils/dom';

import { counters } from '../../counters/metrika';
import { MainContainer } from '../main';

import './styles.scss';

const URL_PARAMS = new URLSearchParams(window.location.search);

const cnLayout = cn('Layout');

export function LayoutContainer(): JSX.Element {
    useEffect(() => {
        dom.on('.legouser__menu-item_action_exit', 'click', () => {
            counters.logout();
        });

        // Hide preloader
        dom.remove('.init-preloader');

        // Метка для RUM FMP
        dom.addClass('body', 'rum--ready');

        // Template для стилей
        dom.addClass(document.documentElement, 'Theme_default');
    }, []);

    return (
        <div className={cnLayout()}>
            <MainContainer />
        </div>
    );
}
