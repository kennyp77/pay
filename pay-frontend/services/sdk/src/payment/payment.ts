import { Button } from '../button';
import { UpdatePaymentData, ButtonOptions, InitPaymentData } from '../typings';

import { BasePayment } from './_base';
import { PaymentProxy } from './proxy';

export class Payment extends BasePayment {
    constructor(paymentData: InitPaymentData) {
        super(paymentData, 'payment');
    }

    public createButton(options: ButtonOptions): Button {
        return new Button(options, new PaymentProxy(this));
    }

    public override update(updateData: UpdatePaymentData): void {
        super.update(updateData);
    }

    public override checkout(): Promise<void> {
        return super.checkout();
    }
}
