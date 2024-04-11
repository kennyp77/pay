import { InitPaymentData, PaymentEnv } from '../typings';

/**
 * Прокси класс, используется в Кнопках
 * Дает доступ к данным и ограничивает доступ к методам,
 * которые могут быть вызваны только мерчами (update / checkout)
 */
export interface PaymentLike {
    env: PaymentEnv;
    sheet: InitPaymentData;
}

export class PaymentProxy {
    private payment: void | PaymentLike;

    constructor(payment: void | PaymentLike) {
        this.payment = payment;
    }

    setPayment(payment: PaymentLike): void {
        this.payment = payment;
    }

    get env(): PaymentEnv {
        return this.payment ? this.payment.env : PaymentEnv.Production;
    }

    get sheet(): void | InitPaymentData {
        return this.payment ? this.payment.sheet : undefined;
    }
}
