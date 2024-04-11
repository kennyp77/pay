import { logError } from '@trust/rum/light/error-logger';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { MessageConnectionListener } from '@trust/utils/connections/message-connection-listener';
import { debug } from '@trust/utils/debug';
import { dom } from '@trust/utils/dom';
import { EventEmitter } from '@trust/utils/event-emitter';
import { random } from '@trust/utils/string/random';

import { SDK_INIT_SPEEDUP_URL } from './config';
import { createFrame } from './helpers/frame';
import { getFormUrl, getFormOrigin } from './helpers/payment-form';
import { onBodyCreate } from './lib/on-body-create';
import { InnerEventType, InnerEvent, SdkReadyExpEvent } from './typings';

interface EventsMap {
    [InnerEventType.SdkReadyExp]: SdkReadyExpEvent;
}

export class SdkInitSpeedup extends EventEmitter<EventsMap> {
    private static instance: SdkInitSpeedup;

    private frame: HTMLIFrameElement;
    private listener: MessageConnectionListener<InnerEvent>;

    static getInstance(): SdkInitSpeedup {
        if (!SdkInitSpeedup.instance) {
            SdkInitSpeedup.instance = new SdkInitSpeedup();
        }

        SdkInitSpeedup.instance.mountFrame();

        return SdkInitSpeedup.instance;
    }

    public mountFrame(): void {
        if (this.frame) {
            return;
        }
        try {
            const frameUrl = getFormUrl(SDK_INIT_SPEEDUP_URL);
            const frameOrigin = getFormOrigin(frameUrl);
            const options = new ConnectionOptions(frameOrigin);
            const target = `ya-frame-${random(8)}`;

            onBodyCreate(() => {
                this.frame = createFrame(target, frameUrl);
                dom.add(document.body, this.frame);
            });

            this.listener = new MessageConnectionListener(options);
            this.listener.on(this.onMessage);
        } catch (err) {
            logError('init speedupFrame', err);
            this.emit(InnerEventType.SdkReadyExp, {
                type: InnerEventType.SdkReadyExp,
                readyToPay: false,
                experiment: { flags: {} },
            });
        }
    }

    private onMessage = (event: InnerEvent): void => {
        if (__DEV__) {
            debug('info')('SdkFrame Event', event);
        }

        if (event && event.type) {
            if (event.type === InnerEventType.SdkReadyExp) {
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
