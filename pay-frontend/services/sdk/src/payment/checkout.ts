import { Button } from '../button';
import { SetupPaymentData, UpdatePaymentData, ButtonOptions, InitPaymentData } from '../typings';

import { BasePayment } from './_base';
import { PaymentProxy } from './proxy';

/**
 * Класс устаревший, и скоро будет убран.
 * @deprecated
 */
export class Checkout extends BasePayment {
    constructor(paymentData: InitPaymentData) {
        super(paymentData, 'checkout');
    }

    public createButton(options: ButtonOptions): Button {
        return new Button(options, new PaymentProxy(this));
    }

    public override setup(setupData: SetupPaymentData): void {
        super.setup(setupData);
    }

    public override update(updateData: UpdatePaymentData): void {
        super.update(updateData);
    }

    public override checkout(): Promise<void> {
        return super.checkout();
    }
}
