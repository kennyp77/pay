import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import prop from '@tinkoff/utils/object/prop';
import { logError, logFatal, logInfo } from '@trust/rum';
import { ConnectionManager } from '@trust/utils/connections/connection-manager';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { QueryConnectionEmitter } from '@trust/utils/connections/query-connection-emitter';
import { IConnectionEmitter } from '@trust/utils/connections/types';
import { EventEmitter } from '@trust/utils/event-emitter';
import {
    AbortEventReason,
    CompleteMessage,
    ErrorEvent,
    ErrorEventReason,
    Message,
    MessageType,
    PaymentEvent,
    PaymentEventType,
    PaymentMessage,
    PingMessage,
    ProcessEvent,
    SuccessEvent,
    UpdateMessage,
} from '@yandex-pay/sdk/src/typings';

const SEND_LOGS_DELAY = 1000;

type EventMap = {
    [MessageType.Payment]: PaymentMessage;
    [MessageType.Complete]: CompleteMessage;
    [MessageType.Ping]: PingMessage;
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
        this.connectionEmitter = this.connectionManager.connect({
            query: { noEmitSourceUrl: true },
        });

        this.checkIsQueryConnection();

        if (prop('target', this.connectionEmitter) === window) {
            logFatal('Broken pay-form connection. Target is window.');
        }
    }

    private writeInStoragesInQueryMode(): void {
        const processSimulationData = JSON.stringify({
            orderAmount: '25055.25',
            paymentMethodInfo: {
                cardLast4: '7777',
                cardNetwork: 'MASTERCARD',
                type: 'CARD',
            },
            token: 'eyJ0eXBlIj'.repeat(170),
            type: 'process',
        });

        if (this.connectionEmitter instanceof QueryConnectionEmitter) {
            ['localStorage', 'sessionStorage'].forEach((key: 'localStorage' | 'sessionStorage') => {
                try {
                    window[key].setItem('storage_process_exp_data', processSimulationData);
                } catch (err: any) {
                    logInfo(`Write in [${key}] error`, err);
                }
            });
        }
    }

    private checkIsQueryConnection() {
        if (this.connectionEmitter instanceof QueryConnectionEmitter) {
            logInfo('Pay form: Query mode');
        }
    }

    // Логируем как часто мы падаем в 404 на Робокассе
    // https://st.yandex-team.ru/YANDEXPAY-3743
    private checkIsRobokassaUrlExceeded(payload: PaymentEvent, merchantId: string) {
        if (this.connectionEmitter instanceof QueryConnectionEmitter) {
            const url = this.connectionEmitter.constructUrl(payload);
            const robokassaMerchantId = '885ad49b-5f21-4771-9cad-bdcc473af4b4';
            const robokassaUrlLengthLimit = 2094;

            if (merchantId === robokassaMerchantId && url.length > robokassaUrlLengthLimit) {
                logError('Robokassa: Url length exceeded');
            }
        }
    }

    private onMessage = (event: Message): void => {
        if (event && event.type && event.type !== MessageType.Setup) {
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

    processPayment(processData: Omit<ProcessEvent, 'type'>, merchantId: string = ''): void {
        const payload: ProcessEvent = {
            type: PaymentEventType.Process,
            ...processData,
        };

        this.writeInStoragesInQueryMode();
        this.checkIsRobokassaUrlExceeded(payload, merchantId);

        setTimeout(() => {
            this.connectionEmitter.send(payload);
        }, SEND_LOGS_DELAY);
    }

    successCheckout(processData: Omit<SuccessEvent, 'type'>): void {
        this.connectionEmitter.send({
            type: PaymentEventType.Success,
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

    get options() {
        return this.connectionOptions;
    }
}
