import { getMerchantId, getOrderAmount, hasSplit } from '@trust/utils/payment-sheet';

import {
    SPLIT_AVAILABLE_AMOUNT_RANGE,
    SPLIT_MERCHANT_WHITELIST,
    IS_SPLIT_AVAILABLE,
} from '../config';

export const isSplitAvailable = (paymentSheet: Sdk.PaymentSheet): boolean => {
    const [minAmount, maxAmount] = SPLIT_AVAILABLE_AMOUNT_RANGE;

    const amount = Number(getOrderAmount(paymentSheet));

    const merchantAvailable = SPLIT_MERCHANT_WHITELIST.includes(getMerchantId(paymentSheet));

    return (
        IS_SPLIT_AVAILABLE &&
        merchantAvailable &&
        hasSplit(paymentSheet) &&
        minAmount <= amount &&
        amount <= maxAmount
    );
};
