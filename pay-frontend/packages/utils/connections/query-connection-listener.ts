import { debug } from '../debug';

import { ConnectionListener } from './connection-listener';
import { ConnectionMessage } from './connection-message';
import { ConnectionOptions } from './connection-options';
import { getDataFromUrl } from './helpers';

export class QueryConnectionListener<T> extends ConnectionListener<T> {
    private processTimeout: number;

    constructor(options: ConnectionOptions) {
        super(options);

        this.processTimeout = setTimeout(this.onProcess);
    }

    private createMessage(): ConnectionMessage<T> {
        const json = getDataFromUrl(this.options.sourceUrl);
        const data = JSON.parse(json);

        return new ConnectionMessage(data.payload, data.channel, data.sourceUrl);
    }

    private onProcess = (): void => {
        try {
            const message = this.createMessage();

            this.processMessage(message);
        } catch (error) {
            if (__DEV__) {
                debug('QueryConnectionListener')(
                    'Failed to process query\n' + ` source url — ${this.options.sourceUrl}`,
                );
                debug('QueryConnectionListener')(error.message);
            }
        }
    };

    destroy(): void {
        clearTimeout(this.processTimeout);
    }
}
