import { tryToCall } from '../fn/try-to-call';

import { ConnectionEmitter } from './connection-emitter';
import { ConnectionMessage } from './connection-message';
import { ConnectionOptions } from './connection-options';
import { getOpener } from './helpers';

export class MessageConnectionEmitter<T> extends ConnectionEmitter<T> {
    private _target: Window;

    constructor(options: ConnectionOptions, target: Window = getOpener()) {
        super(options);

        this.setTarget(target);
    }

    protected setTarget(target: Window) {
        this._target = target;

        if (!this.isConnected) {
            throw new TypeError('Target is not set or closed.');
        }
    }

    protected createMessage(payload: T): ConnectionMessage<T> {
        return new ConnectionMessage(payload, this.options.channel, this.options.sourceUrl);
    }

    send(payload: T): void {
        if (this.isConnected) {
            const message = this.createMessage(payload);

            tryToCall(() => {
                this.target.postMessage(String(message), this.options.targetOrigin);
            });
        }
    }

    destroy(): void {
        this._target = null;
    }

    get target(): Window {
        return this._target;
    }

    get isConnected(): boolean {
        return Boolean(this.target && !this.target.closed);
    }
}
