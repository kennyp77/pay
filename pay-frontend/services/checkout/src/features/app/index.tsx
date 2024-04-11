import React, { useEffect, useRef } from 'react';

import { logDebug } from '@trust/rum';
import { dom } from '@trust/utils/dom';
import { useService } from '@yandex-pay/react-services';
import { MessageType } from '@yandex-pay/sdk/src/typings';
import { useSelector } from 'react-redux';

import { isShowSuccessInfo } from 'store/checkout';

import { counters } from '../../counters';
import { checkUnclosedForm } from '../../helpers/app';
import { closeWindow } from '../../helpers/window';
import { FormConnection } from '../../lib/intercom';
import * as app from '../../store/app';

interface AppInitProps {
    children: React.ReactNode | JSX.Element;
}

export function AppInit({ children }: AppInitProps) {
    const closeWindowOnSuccess = useRef(true);

    const initialize = useService(app.initializeApp);
    const watch = useService(app.initializeWatchers);
    const showSuccessInfo = useSelector(isShowSuccessInfo);

    useEffect(() => {
        if (showSuccessInfo) {
            closeWindowOnSuccess.current = false;
        }
    }, [showSuccessInfo]);

    useEffect(() => {
        const adapter = FormConnection.getInstance();

        const formReady = (): void => {
            counters.formLoad();
            adapter.formReady();
        };

        const formClose = (): void => {
            counters.formClose();
            adapter.formClose();
        };

        adapter.once(MessageType.Complete, (event) => {
            counters.paymentComplete({ reason: event?.reason });

            logDebug('Receive complete message');

            if (closeWindowOnSuccess.current) {
                // NB: Задержка для отправки счетчиков
                setTimeout(() => {
                    closeWindow();
                    // NB: Были сообщения о "зависании" окна в незакрытом сосотоянии
                    //     Такое поведение тут отслеживается
                    checkUnclosedForm('complete_message');
                }, 500);
            }
        });

        dom.on(window, 'beforeunload', formClose);
        dom.on(window, 'unload', formClose);

        dom.on('.legouser__menu-item_action_exit', 'click', () => {
            counters.logout();
        });

        formReady();
        initialize();
        watch();

        // Hide preloader
        dom.remove('.init-preloader');

        // Метка для RUM FMP
        dom.addClass('body', 'rum--ready');
    }, [initialize, watch]);

    return children;
}
