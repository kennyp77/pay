import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { ConnectionManager } from '@trust/utils/connections/connection-manager';
import { ConnectionNative } from '@trust/utils/connections/connection-native';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { IConnectionEmitter } from '@trust/utils/connections/types';
import { EventEmitter } from '@trust/utils/event-emitter';
import {
    AbortEventReason,
    CompleteMessage,
    Coupon,
    ErrorEvent,
    ErrorEventReason,
    Message,
    MessageType,
    PaymentEvent,
    PaymentEventType,
    PaymentMessage,
    PingMessage,
    ProcessEvent,
    ShippingAddress,
    ShippingOption,
    SetupMessage,
    UpdateMessage,
    SuccessEvent,
} from '@yandex-pay/sdk/src/typings';

type EventMap = {
    [MessageType.Setup]: SetupMessage;
    [MessageType.Payment]: PaymentMessage;
    [MessageType.Complete]: CompleteMessage;
    [MessageType.Ping]: PingMessage;
    [MessageType.Update]: UpdateMessage;
};

interface ChangeEventData {
    shippingAddress?: ShippingAddress;
    shippingOption?: ShippingOption;
    coupon?: Coupon;
    pickupBounds?: Sdk.GeoBounds;
    pickupArea?: {
        bounds: Sdk.GeoBounds;
        center: Sdk.GeoPoint;
    };
    pickupInfo?: Sdk.PickupInfo;
    pickupPoint?: Sdk.PickupPoint;
}

interface ResetEventData {
    shippingOption?: boolean;
    coupon?: boolean;
}

interface SetupEventData {
    pickupPoints?: boolean;
}

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
            native: { target: ConnectionNative.nativeTarget() },
        });
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

    successCheckout(processData: Omit<SuccessEvent, 'type'>): void {
        this.connectionEmitter.send({
            type: PaymentEventType.Success,
            ...processData,
        });
    }

    ping(): void {
        if (this.connectionEmitter.isConnected) {
            this.connectionEmitter.send({ type: PaymentEventType.Ping });
        }
    }

    change(changeData: ChangeEventData): void {
        if (this.connectionEmitter.isConnected) {
            this.connectionEmitter.send({
                type: PaymentEventType.Change,
                ...changeData,
            });
        }
    }

    reset(resetOptions: ResetEventData): void {
        if (this.connectionEmitter.isConnected) {
            this.connectionEmitter.send({
                type: PaymentEventType.Reset,
                ...resetOptions,
            });
        }
    }

    setup(setupOptions: SetupEventData) {
        if (this.connectionEmitter.isConnected) {
            this.connectionEmitter.send({
                type: PaymentEventType.Setup,
                ...setupOptions,
            });
        }
    }

    get options() {
        return this.connectionOptions;
    }
}
