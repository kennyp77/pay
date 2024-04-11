import { debug } from '../debug';
import { SimpleEmitter } from '../event-emitter';
import { replaceWith } from '../url';

import { ConnectionMessage } from './connection-message';
import { ConnectionOptions } from './connection-options';
import { DEFAULT_URL } from './constants';
import { removeDataFromUrl } from './helpers';
import { MessageConnectionAgent } from './message-connection-agent';
import { MessageConnectionEmitter } from './message-connection-emitter';
import { MessageConnectionListener } from './message-connection-listener';
import { NativeConnectionEmitter } from './native-connection-emitter';
import { QueryConnectionAgent } from './query-connection-agent';
import { QueryConnectionEmitter } from './query-connection-emitter';
import { QueryConnectionListener } from './query-connection-listener';
import {
    IConnectionAgent,
    IConnectionEmitter,
    IConnectionListener,
    ConnectionMessageTuple,
    QueryEmitterParams,
    MessageEmitterParams,
    NativeEmitterParams,
} from './types';

interface ManagerConnectParams {
    query?: QueryEmitterParams;
    message?: MessageEmitterParams;
    native?: NativeEmitterParams;
}

/**
 * Protocol:
 * A ------------------------ B
 * HAS target of A            HAS target of B
 * HAS origin of A            HAS origin of B
 * HAS target of B
 * HAS origin of B
 * HAS channel
 *
 * A -> SEND message -------> B
 *       WITH payload         SET target of A (from sourceUrl)
 *       WITH sourceUrl of A  SET origin of A (from sourceUrl)
 *       WITH channel         SET channel
 *
 * A ------------------------ B
 * HAS target of A            HAS target of B
 * HAS origin of A            HAS origin of B
 * HAS target of B            HAS target of A
 * HAS origin of B            HAS origin of A
 * HAS channel                HAS channel
 *
 * B -> SEND message -------> A
 *       WITH payload         SET target of B (from sourceUrl)
 *       WITH sourceUrl of B  SET origin of B (from sourceUrl)
 *       WITH channel         SET channel
 *
 * A ------------------------ B
 * HAS target of A            HAS target of B
 * HAS origin of A            HAS origin of B
 * HAS target of B            HAS target of A
 * HAS origin of B            HAS origin of A
 * HAS channel                HAS channel
 *
 */

export class ConnectionManager<R, S>
    extends SimpleEmitter<ConnectionMessageTuple<R>>
    implements IConnectionListener
{
    private queryListener: QueryConnectionListener<R>;
    private messageListener: MessageConnectionListener<R>;

    constructor(readonly options: ConnectionOptions = new ConnectionOptions()) {
        super();

        this.createQueryListener();
        this.createMessageListener();
    }

    private createQueryListener(): void {
        this.queryListener = new QueryConnectionListener(this.options);
        this.queryListener.on(this.onMessage);
        this.queryListener.on(this.onOptionsMessage);
    }

    private createMessageListener(): void {
        this.messageListener = new MessageConnectionListener(this.options);
        this.messageListener.on(this.onMessage);
    }

    private clearSource(): void {
        if (__DEV__) {
            debug('ConnectionManager')('Remove data from the source url');
        }

        const clearedUrl = removeDataFromUrl(this.options.sourceUrl);

        replaceWith(clearedUrl);
    }

    private updateOptions(message: ConnectionMessage<R>): void {
        if (__DEV__) {
            debug('ConnectionManager')(`Update options with the message\n message - ${message}`);
        }

        this.options.targetUrl = message.sourceUrl || DEFAULT_URL;
        // TODO: Нужно отключить каналы в sdk
        //       вот тут https://github.yandex-team.ru/trust/yandex-pay/blob/v0.11.0/services/sdk/src/payment.ts#L79
        //       а после вернуть проверку тут
        // this.options.channel = message.channel;
    }

    private onMessage = (payload: R, message: ConnectionMessage<R>): void => {
        this.emit(payload, message);
    };

    private onOptionsMessage = (_payload: R, message: ConnectionMessage<R>): void => {
        if (this.options.isInitialized) {
            this.clearSource();
        } else {
            this.updateOptions(message);
        }
    };

    connect(params: ManagerConnectParams = {}): IConnectionEmitter<S> {
        if (params.native && params.native.target) {
            return new NativeConnectionEmitter(this.options, params.native.target);
        }

        try {
            return new MessageConnectionEmitter(this.options, params.message?.target);
        } catch (unused) {
            return new QueryConnectionEmitter(this.options, params.query);
        }
    }

    open(
        payload: S,
        features?: string,
        beforeQuery?: Sys.CallbackFn0<boolean>,
    ): IConnectionAgent<S> {
        try {
            return new MessageConnectionAgent(this.options, payload, features);
        } catch (unused) {
            const wantDelay = beforeQuery?.();

            return new QueryConnectionAgent(this.options, payload, wantDelay);
        }
    }

    destroy(): void {
        this.queryListener.destroy();
        this.messageListener.destroy();
    }
}
