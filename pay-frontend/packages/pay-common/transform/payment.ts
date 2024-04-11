import { checkout } from '@trust/pay-api';
import { PaymentMethodInfo } from '@yandex-pay/sdk/src/typings';

export function toPaymentData(res: Sys.Return<typeof checkout>): {
    token: Sdk.PaymentToken;
    paymentMethodInfo: PaymentMethodInfo;
} {
    const { paymentToken, paymentMethodInfo } = res.data;

    return {
        token: paymentToken,
        paymentMethodInfo: paymentMethodInfo as PaymentMethodInfo,
    };
}
