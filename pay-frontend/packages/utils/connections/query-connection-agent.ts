import { ConnectionOptions } from './connection-options';
import { QueryConnectionEmitter } from './query-connection-emitter';
import { IConnectionAgent } from './types';

// delaySending - параметр для отсрочки редиректа чтобы мы могли успеть отправить логи
export class QueryConnectionAgent<T>
    extends QueryConnectionEmitter<T>
    implements IConnectionAgent<T>
{
    constructor(options: ConnectionOptions, payload: T, delaySending = false) {
        super(options);

        if (delaySending) {
            setTimeout(() => this.send(payload), 500);
        } else {
            this.send(payload);
        }
    }

    focus(): void {
        /* not connectable */
    }

    close(): void {
        /* not connectable */
    }
}
