import { toUpdatePayment, toInitPaymentData } from '../helpers/payment-sheet';
import { PaymentDataV3, UpdatePaymentDataV3 } from '../typings';

import { BasePayment } from './_base';

export class CheckoutV3 extends BasePayment {
    constructor(paymentData: PaymentDataV3) {
        super(toInitPaymentData(paymentData), 'checkout-v3');
    }

    public override update(updateData: UpdatePaymentDataV3): void {
        super.update(toUpdatePayment(updateData));
    }
}
