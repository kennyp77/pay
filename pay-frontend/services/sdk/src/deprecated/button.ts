import { logInfo } from '@trust/rum/light/error-logger';

import { Button } from '../button';
import { innerEmitter } from '../inner-emitter';
import { counters } from '../metrika';
import { PaymentProxy, PaymentLike } from '../payment';
import { ButtonOptions, InnerEventType } from '../typings';

/**
 * TS doesn't support the static inheritance.
 */
// @ts-ignore
export class DeprecatedButton extends Button {
    static lastPayment: void | PaymentLike;
    private static waitProxies: PaymentProxy[] = [];

    static create(options: ButtonOptions): DeprecatedButton {
        return new DeprecatedButton(options);
    }

    static setPayment(payment: PaymentLike): void {
        DeprecatedButton.lastPayment = payment;

        DeprecatedButton.waitProxies.forEach((paymentProxy) => {
            paymentProxy.setPayment(payment);
        });

        DeprecatedButton.waitProxies = [];
        innerEmitter.emit(InnerEventType.PaymentUpdate, undefined);
    }

    constructor(options: ButtonOptions) {
        logInfo('Usage of DeprecatedButton');

        const payment = DeprecatedButton.lastPayment;
        const paymentProxy = new PaymentProxy(payment);

        super(options, paymentProxy);

        // Если платежа нет, т.е. кнопка была создара до его инициализации
        // то ставим paymentProxy в очередь на его получение
        if (!payment) {
            DeprecatedButton.waitProxies.push(paymentProxy);
            counters.emptyPaymentData();
        }
    }
}
