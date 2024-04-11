import { tryToCall } from '../fn/try-to-call';

import { ConnectionEmitter } from './connection-emitter';
import { ConnectionMessage } from './connection-message';
import { ConnectionOptions } from './connection-options';
import { NativeTarget } from './types';

export class NativeConnectionEmitter<T> extends ConnectionEmitter<T> {
    private target: NativeTarget;

    constructor(options: ConnectionOptions, target: NativeTarget) {
        super(options);

        this.target = target;
    }

    protected createMessage(payload: T): ConnectionMessage<T> {
        return new ConnectionMessage(payload, this.options.channel, this.options.sourceUrl);
    }

    send(payload: T): void {
        const message = this.createMessage(payload);

        tryToCall(() => {
            this.target.postMessage(String(message), this.options.targetOrigin);
        });
    }

    destroy(): void {}

    get isConnected(): boolean {
        return true;
    }
}
