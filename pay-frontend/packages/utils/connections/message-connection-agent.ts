import { tryToCall } from '../fn/try-to-call';

import { ConnectionOptions } from './connection-options';
import { getTop, openWindow, setDataToUrl } from './helpers';
import { MessageConnectionEmitter } from './message-connection-emitter';
import { IConnectionAgent } from './types';

export class MessageConnectionAgent<T> extends MessageConnectionEmitter<T> implements IConnectionAgent<T> {
    constructor(options: ConnectionOptions, payload: T, features?: string) {
        super(options, getTop());

        const message = this.createMessage(payload);
        const url = setDataToUrl(options.targetUrl, String(message));
        const target = openWindow(url, {
            target: options.channel,
            features,
        });

        this.setTarget(target);
    }

    focus(): void {
        if (this.isConnected) {
            tryToCall(() => {
                this.target.focus();
            });
        }
    }

    close(): void {
        if (this.isConnected) {
            tryToCall(() => {
                this.target.close();
            });
        }
    }
}
