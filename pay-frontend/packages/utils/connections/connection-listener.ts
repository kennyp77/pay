import { debug } from '../debug';
import { SimpleEmitter } from '../event-emitter';

import { ConnectionMessage } from './connection-message';
import { ConnectionOptions } from './connection-options';
import { ANY_ORIGIN, ANY_CHANNEL } from './constants';
import { IConnectionListener, ConnectionMessageTuple } from './types';

export abstract class ConnectionListener<T>
    extends SimpleEmitter<ConnectionMessageTuple<T>>
    implements IConnectionListener
{
    constructor(readonly options: ConnectionOptions) {
        super();
    }

    protected processMessage(message: ConnectionMessage<T>): void {
        const { options } = this;

        if (
            message.origin !== options.targetOrigin &&
            message.origin !== ANY_ORIGIN &&
            options.targetOrigin !== ANY_ORIGIN
        ) {
            throw new Error(
                'Failed to process a message with a different origin\n' +
                    ` message origin — ${message.origin}\n` +
                    ` target origin — ${options.targetOrigin}`,
            );
        }

        if (
            message.channel !== options.channel &&
            message.channel !== ANY_CHANNEL &&
            options.channel !== ANY_CHANNEL
        ) {
            throw new Error(
                'Failed to process a message with a different channel\n' +
                    ` message channel — ${message.channel}\n` +
                    ` current channel — ${options.targetOrigin}`,
            );
        }

        if (__DEV__) {
            debug('ConnectionListener')(`Received message\n message - ${message}`);
        }

        this.emit(message.payload, message);
    }

    abstract destroy(): void;
}
