import { logError } from '@trust/rum/light/error-logger';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { MessageConnectionListener } from '@trust/utils/connections/message-connection-listener';
import { debug } from '@trust/utils/debug';
import { dom } from '@trust/utils/dom';
import { EventEmitter } from '@trust/utils/event-emitter';
import { getOrigin } from '@trust/utils/url';
import { isInFrame } from '@trust/utils/window';

import { SDK_READY_CHECK_URL } from './config';
import { openIframe } from './helpers/frame';
import { getFormUrl } from './helpers/payment-form';
import { InnerEventType, SdkReadyCheckEvent, ReadyToPayCheckOptions } from './typings';

interface EventsMap {
    [InnerEventType.SdkReadyCheck]: SdkReadyCheckEvent;
}

const defaultCheckOptions: Partial<ReadyToPayCheckOptions> = {
    checkActiveCard: false,
};

class SdkReadyCheck extends EventEmitter<EventsMap> {
    private frame: HTMLIFrameElement;
    private listener: MessageConnectionListener<SdkReadyCheckEvent>;

    constructor(options: ReadyToPayCheckOptions) {
        super();

        const checkOptions = {
            ...defaultCheckOptions,
            ...options,
        };

        const frameUrl = getFormUrl(SDK_READY_CHECK_URL, null, { env: options.env });
        const connectionOptions = new ConnectionOptions(getOrigin(frameUrl));

        this.frame = openIframe(document.body, {
            payload: { checkOptions },
            enctype: 'application/x-www-form-urlencoded',
            method: 'post',
            url: frameUrl,
        });

        this.listener = new MessageConnectionListener(connectionOptions);
        this.listener.on(this.onMessage);
    }

    private onMessage = (event: SdkReadyCheckEvent): void => {
        if (__DEV__) {
            debug('info')('SdkReadyCheck Event', event);
        }

        if (event && event.type) {
            this.emit(event.type, event);
        }
    };

    destroy(): void {
        super.destroy();

        dom.remove(this.frame);
        this.frame = undefined;

        this.listener.destroy();
        this.listener = undefined;
    }
}

export function readyToPayCheck(options: ReadyToPayCheckOptions): Promise<boolean> {
    return new Promise((resolve) => {
        const frame = new SdkReadyCheck(options);

        frame.once(InnerEventType.SdkReadyCheck, (event) => {
            frame.destroy();

            const isWebviewFrame = event.isWebview && isInFrame();

            resolve(event.readyToPay && !isWebviewFrame);

            if (event.readyToPay && isWebviewFrame) {
                logError('webview_with_frame (readyToPayCheck)');
            }
        });
    });
}
