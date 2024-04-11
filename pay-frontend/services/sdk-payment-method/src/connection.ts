import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { MessageConnectionEmitter } from '@trust/utils/connections/message-connection-emitter';
import { MessageConnectionListener } from '@trust/utils/connections/message-connection-listener';
import { InitPaymentSheet } from '@yandex-pay/sdk/src/typings';

import { PARENT_ORIGIN } from './config';
import {
    PayButtonType,
    SdkPaymentMethodEvent,
    SdkPaymentMethodEventType,
    SdkPaymentMethodMessage,
    SdkPaymentMethodMessageType,
} from './typings';

const connectionOptions = new ConnectionOptions(PARENT_ORIGIN);

const parentEmitter = new MessageConnectionEmitter<SdkPaymentMethodEvent>(
    connectionOptions,
    window.parent,
);

const parentListener = new MessageConnectionListener<SdkPaymentMethodMessage>(connectionOptions);

export const sendReady = (buttonType: PayButtonType): void => {
    parentEmitter.send({ type: SdkPaymentMethodEventType.Ready, buttonType });

    // Метка для RUM FMP
    // Сейчас тут т.к. кнопка показывается только после этого события
    document.body.classList.add('rum--ready');
};

export const sendFailure = (): void => {
    parentEmitter.send({ type: SdkPaymentMethodEventType.Failure });
};

export const onPaymentUpdate = (callback: (data: InitPaymentSheet) => void): void => {
    parentListener.on((message) => {
        if (message.type === SdkPaymentMethodMessageType.Update) {
            callback(message.paymentSheet);
        }
    });
};
