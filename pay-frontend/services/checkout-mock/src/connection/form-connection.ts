import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { ConnectionManager } from '@trust/utils/connections/connection-manager';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { IConnectionEmitter } from '@trust/utils/connections/types';
import { EventEmitter } from '@trust/utils/event-emitter';
import {
    PaymentEventType,
    PaymentEvent,
    ErrorEvent,
    ErrorEventReason,
    AbortEventReason,
    MessageType,
    Message,
    PaymentMessage,
    CompleteMessage,
    PingMessage,
    SetupMessage,
    UpdateMessage,
    ProcessEvent,
} from '@yandex-pay/sdk/src/typings';

type EventMap = {
    [MessageType.Payment]: PaymentMessage;
    [MessageType.Complete]: CompleteMessage;
    [MessageType.Ping]: PingMessage;
    [MessageType.Setup]: SetupMessage;
    [MessageType.Update]: UpdateMessage;
};

export class FormConnection extends EventEmitter<EventMap> {
    private connectionOptions: ConnectionOptions;
    private connectionManager: ConnectionManager<Message, PaymentEvent>;
    private connectionEmitter: IConnectionEmitter<PaymentEvent>;

    static getInstance = memoizeOnce((): FormConnection => {
        return new FormConnection();
    });

    constructor() {
        super();

        this.connectionOptions = new ConnectionOptions();
        this.connectionManager = new ConnectionManager(this.connectionOptions);
        this.connectionManager.on(this.onMessage);
        this.connectionEmitter = this.connectionManager.connect();
    }

    private onMessage = (event: Message): void => {
        if (event && event.type) {
            this.emit(event.type, event);
        }
    };

    formReady(): void {
        if (this.connectionEmitter.isConnected) {
            this.connectionEmitter.send({ type: PaymentEventType.Ready });
        }
    }

    formClose(): void {
        this.connectionEmitter.send({
            type: PaymentEventType.Abort,
            reason: AbortEventReason.Close,
        });
    }

    formError(error: ErrorEventReason, details?: Record<string, any>): void {
        const message: ErrorEvent = {
            type: PaymentEventType.Error,
            reason: error,
        };

        if (details) {
            message.details = details;
        }

        this.connectionEmitter.send(message);
    }

    processPayment(processData: Omit<ProcessEvent, 'type'>): void {
        this.connectionEmitter.send({
            type: PaymentEventType.Process,
            ...processData,
        });
    }

    ping(): void {
        if (this.connectionEmitter.isConnected) {
            this.connectionEmitter.send({ type: PaymentEventType.Ping });
        } else {
            this.emit(MessageType.Ping, { type: MessageType.Ping });
        }
    }

    send(payload: any): void {
        if (this.connectionEmitter.isConnected) {
            this.connectionEmitter.send(payload);
        }
    }

    get options() {
        return this.connectionOptions;
    }
}
