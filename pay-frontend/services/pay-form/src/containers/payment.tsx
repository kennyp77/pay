import React, { useEffect } from 'react';

import AdditionalInformation from '@trust/ui/components/additional-information';
import Payment from '@trust/ui/components/payment';
import { dom } from '@trust/utils/dom';
import { MessageType } from '@yandex-pay/sdk/src/typings';
import { useSelector } from 'react-redux';

import { counters } from '../counters/metrika';
import { checkUnclosedForm } from '../helpers/app';
import { closeWindow } from '../helpers/window';
import { useAction } from '../hooks/use-action';
import { FormConnection } from '../lib/intercom';
import { initializeAction } from '../store/app/async-actions';
import { getScreen, getPending } from '../store/app/selectors';

import PaymentContentContainer from './payment-content';
import PaymentPreloaderContainer from './payment-preloader';

export default function PaymentContainer(): JSX.Element {
    const screen = useSelector(getScreen);
    const pending = useSelector(getPending);

    const initialize = useAction(initializeAction);

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
            counters.paymentComplete({ reason: event.reason });

            // NB: Задержка для отправки счетчиков
            setTimeout(() => {
                closeWindow();
                // NB: Были сообщения о "зависании" окна в незакрытом сосотоянии
                //     Такое поведение тут отслеживается
                checkUnclosedForm('complete_message');
            }, 500);
        });

        dom.on(window, 'beforeunload', formClose);
        dom.on(window, 'unload', formClose);

        dom.on('.legouser__menu-item_action_exit', 'click', () => {
            counters.logout();
        });

        formReady();
        initialize();

        // Hide preloader
        dom.remove('.init-preloader');

        // Метка для RUM FMP
        dom.addClass('body', 'rum--ready');

        return (): void => {
            adapter.destroy();
        };
    }, []);

    return (
        <Payment
            screen={screen}
            preloader={pending && <PaymentPreloaderContainer />}
            content={<PaymentContentContainer />}
            footer={<AdditionalInformation inverse />}
        />
    );
}
