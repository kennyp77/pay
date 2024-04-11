import { pay } from '../../testing-utils';
import { redirectTo } from '../url';

import { ConnectionEmitter } from './connection-emitter';
import { ConnectionMessage } from './connection-message';
import { ConnectionOptions } from './connection-options';
import { setDataToUrl } from './helpers';
import { QueryEmitterParams } from './types';

export class QueryConnectionEmitter<T> extends ConnectionEmitter<T> {
    private isSent: boolean = false;

    constructor(options: ConnectionOptions, readonly params: QueryEmitterParams = {}) {
        super(options);
    }

    protected createMessage(payload: T): ConnectionMessage<T> {
        let { sourceUrl } = this.options;

        if (this.params.noEmitSourceUrl) {
            sourceUrl = undefined;
        }

        return new ConnectionMessage(payload, this.options.channel, sourceUrl);
    }

    // Метод публичный чтобы можно было сформировать Url в форме для проверки его длины
    public constructUrl(payload: T): string {
        const message = this.createMessage(payload);
        const url = setDataToUrl(this.options.targetUrl, String(message));

        return url;
    }

    send(payload: T): void {
        if (!this.isSent) {
            const url = this.constructUrl(payload);

            redirectTo(url);
            this.isSent = true;
        }
    }

    destroy(): void {
        this.isSent = true;
    }

    get isConnected(): boolean {
        return false;
    }
}
