import { logError } from '@trust/rum/light/error-logger';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { MessageConnectionListener } from '@trust/utils/connections/message-connection-listener';
import { debug } from '@trust/utils/debug';
import { dom } from '@trust/utils/dom';
import { EventEmitter } from '@trust/utils/event-emitter';

import { SDK_INIT_URL } from './config';
import { openIframe } from './helpers/frame';
import { getFormUrl, getFormOrigin } from './helpers/payment-form';
import {
    InnerEventType,
    InnerEvent,
    SdkReadyEvent,
    SdkExperimentsEvent,
    InitPaymentData,
} from './typings';

interface EventsMap {
    [InnerEventType.SdkReady]: SdkReadyEvent;
    [InnerEventType.SdkExp]: SdkExperimentsEvent;
}

export class SdkInitFrame extends EventEmitter<EventsMap> {
    private static instance: SdkInitFrame;

    private frame: HTMLIFrameElement;
    private listener: MessageConnectionListener<InnerEvent>;

    static getInstance(): SdkInitFrame {
        if (!SdkInitFrame.instance) {
            SdkInitFrame.instance = new SdkInitFrame();
        }

        return SdkInitFrame.instance;
    }

    public mountFrame(paymentData: InitPaymentData): void {
        try {
            if (this.frame) {
                this.unmountFrame();
            }

            const { env, ...sheet } = paymentData;

            // Временное решение, для тестирования YANDEXPAY-3905
            const fromRedirect = /\?|&__YP__=/.test(window.location.search);

            const frameUrl = getFormUrl(SDK_INIT_URL, sheet, { env, fromRedirect });
            const frameOrigin = getFormOrigin(frameUrl);
            const options = new ConnectionOptions(frameOrigin);

            this.frame = openIframe(document.body, {
                payload: { paymentSheet: sheet },
                enctype: 'application/x-www-form-urlencoded',
                method: 'post',
                url: frameUrl,
            });

            this.listener = new MessageConnectionListener(options);
            this.listener.on(this.onMessage);
        } catch (err) {
            logError('init frame', err);
            this.emit(InnerEventType.SdkReady, {
                type: InnerEventType.SdkReady,
                readyToPay: false,
            });
        }
    }

    private onMessage = (event: InnerEvent): void => {
        if (__DEV__) {
            debug('SdkInit')('Event', event);
        }

        if (event && event.type) {
            if (event.type === InnerEventType.SdkReady || event.type === InnerEventType.SdkExp) {
                this.emit(event.type, event);
            }
        }
    };

    public unmountFrame(): void {
        if (this.frame) {
            dom.remove(this.frame);
            this.frame = undefined;
        }

        if (this.listener) {
            this.listener.destroy();
            this.listener = undefined;
        }
    }
}
