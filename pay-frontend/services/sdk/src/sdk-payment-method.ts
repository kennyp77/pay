import { timeEnd } from '@trust/rum/light/delta-logger';
import { logError } from '@trust/rum/light/error-logger';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { MessageConnectionEmitter } from '@trust/utils/connections/message-connection-emitter';
import { MessageConnectionListener } from '@trust/utils/connections/message-connection-listener';
import { dom } from '@trust/utils/dom';
import { EventEmitter } from '@trust/utils/event-emitter';
import {
    SdkPaymentMethodEvent,
    SdkPaymentMethodEventType,
    SdkPaymentMethodReadyEvent,
    SdkPaymentMethodFailureEvent,
    SdkPaymentMethodMessage,
    SdkPaymentMethodMessageType,
} from '@yandex-pay/sdk-payment-method/src/typings';

import { RUM_DELTA_NAMES, SDK_PAYMENT_METHOD_URL } from './config';
import { openIframe } from './helpers/frame';
import { getFormUrl, getFormOrigin } from './helpers/payment-form';
import { innerEmitter } from './inner-emitter';
import { PaymentProxy } from './payment';
import { InnerEventType, ButtonOptions, ButtonStyles } from './typings';

interface SdkPaymentMethodEventsMap {
    [SdkPaymentMethodEventType.Ready]: SdkPaymentMethodReadyEvent;
    [SdkPaymentMethodEventType.Failure]: SdkPaymentMethodFailureEvent;
}

export default class SdkPaymentMethod extends EventEmitter<SdkPaymentMethodEventsMap> {
    private frame: HTMLIFrameElement;
    private frameListener: MessageConnectionListener<SdkPaymentMethodEvent>;
    private frameEmitter: MessageConnectionEmitter<SdkPaymentMethodMessage>;
    private payment: PaymentProxy;
    private buttonOptions: ButtonOptions;
    private buttonStyles: ButtonStyles;

    static create(
        payment: PaymentProxy,
        buttonOptions: ButtonOptions,
        buttonStyles: ButtonStyles,
    ): SdkPaymentMethod {
        return new SdkPaymentMethod(payment, buttonOptions, buttonStyles);
    }

    constructor(payment: PaymentProxy, buttonOptions: ButtonOptions, buttonStyles: ButtonStyles) {
        super();

        this.payment = payment;
        this.buttonOptions = buttonOptions;
        this.buttonStyles = buttonStyles;

        this.subscribePayment();
    }

    destroy(): void {
        super.destroy();
        this.unmount();
    }

    mount(parent: HTMLElement): void {
        try {
            if (this.frame) {
                return;
            }

            const { buttonOptions, buttonStyles } = this;
            const { sheet: paymentSheet, env } = this.payment;
            const frameUrl = getFormUrl(SDK_PAYMENT_METHOD_URL, paymentSheet, { env });
            const frameOrigin = getFormOrigin(frameUrl);

            this.frame = openIframe(parent, {
                payload: { paymentSheet, buttonOptions, buttonStyles },
                enctype: 'application/x-www-form-urlencoded',
                method: 'post',
                url: frameUrl,
            });

            const connectionOptions = new ConnectionOptions(frameOrigin);

            this.frameListener = new MessageConnectionListener(connectionOptions);
            this.frameListener.on(this.onMessage);
            this.frameEmitter = new MessageConnectionEmitter(
                connectionOptions,
                this.frame.contentWindow,
            );
        } catch (err) {
            logError('sdk-payment-method mount', err);
        }
    }

    unmount(): void {
        if (this.frame) {
            dom.remove(this.frame);
            this.frame = undefined;
        }

        if (this.frameListener) {
            this.frameListener.destroy();
            this.frameListener = undefined;
        }

        if (this.frameEmitter) {
            this.frameEmitter.destroy();
            this.frameEmitter = undefined;
        }

        this.unsubscribePayment();
    }

    show(): void {
        if (this.frame) {
            dom.show(this.frame);
            dom.style(this.frame, {
                width: '100%',
                height: '100%',
            });
            dom.animate(this.frame, {
                property: 'opacity',
                from: '0',
                to: '1',
            });

            timeEnd(RUM_DELTA_NAMES.PaymentMethodsShowFromButtonMount);
            timeEnd(RUM_DELTA_NAMES.PaymentMethodsShowFromPaymentCreate);
        }
    }

    private onMessage = (event: SdkPaymentMethodEvent): void => {
        if (event && event.type) {
            this.emit(event.type, event);
        }
    };

    private onPaymentUpdate = (): void => {
        if (this.frameEmitter) {
            this.frameEmitter.send({
                type: SdkPaymentMethodMessageType.Update,
                paymentSheet: this.payment.sheet,
            });
        }
    };

    private subscribePayment(): void {
        innerEmitter.on(InnerEventType.PaymentUpdate, this.onPaymentUpdate);
    }

    private unsubscribePayment(): void {
        innerEmitter.off(InnerEventType.PaymentUpdate, this.onPaymentUpdate);
    }
}
