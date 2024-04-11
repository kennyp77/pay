import { debug } from '../debug';
import { getOrigin } from '../url';

import { ConnectionListener } from './connection-listener';
import { ConnectionMessage } from './connection-message';
import { ConnectionOptions } from './connection-options';

export class MessageConnectionListener<T> extends ConnectionListener<T> {
    constructor(options: ConnectionOptions) {
        super(options);

        window.addEventListener('message', this.onMessage);
    }

    private createMessage(event: MessageEvent): ConnectionMessage<T> {
        const data = JSON.parse(event.data);
        const sourceUrl =
            data.sourceUrl && getOrigin(data.sourceUrl) === event.origin
                ? data.sourceUrl
                : event.origin;

        return new ConnectionMessage(data.payload, data.channel, sourceUrl);
    }

    private onMessage = (event: MessageEvent): void => {
        try {
            const message = this.createMessage(event);

            this.processMessage(message);
        } catch (error) {
            if (__DEV__) {
                debug('MessageConnectionListener')(
                    'Failed to process event\n' +
                        ` event origin — ${event.origin}\n` +
                        ` event data - ${event.data}`,
                );
                debug('MessageConnectionListener')(error.message);
            }
        }
    };

    destroy(): void {
        window.removeEventListener('message', this.onMessage);
    }
}
