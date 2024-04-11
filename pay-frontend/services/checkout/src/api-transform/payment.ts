import head from '@tinkoff/utils/array/head';
import toArray from '@tinkoff/utils/array/toArray';

import { loadSplitPlans, checkout } from '../api/pay-api';

export function paymentData(res: Sys.Return<typeof checkout>): {
    token: Sdk.PaymentToken;
    paymentMethodInfo: Sdk.PaymentMethodInfo;
} {
    const { paymentToken, paymentMethodInfo } = res.data;

    return {
        token: paymentToken,
        paymentMethodInfo: paymentMethodInfo as Sdk.PaymentMethodInfo,
    };
}

export function splitPlan(res: Sys.Return<typeof loadSplitPlans>): Checkout.SplitPlan | null {
    const plan = head(res.data.plans);

    if (plan) {
        return {
            id: plan.id ?? '',
            sum: plan.sum ?? '',
            payments: toArray(plan.payments).map((payment) => ({
                status: payment.status,
                datetime: new Date(payment.datetime),
                amount: payment.amount,
            })),
        };
    }

    return null;
}
