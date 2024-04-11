import { PaymentCashback } from '@trust/utils/payment-methods/typings';
import { CurrencyCode, InitPaymentSheet } from '@yandex-pay/sdk/src/typings';

import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

interface Response {
    cashback: PaymentCashback;
}

interface GetCashbackParams {
    sheet: InitPaymentSheet;
    cardId?: string;
}

interface CashbackCheckoutSheet {
    merchantId: string;
    cartTotal?: string;
    currencyCode: CurrencyCode;
}

type CashbackPayload = Sys.StrictUnion<
    | { cardId: string; sheet: InitPaymentSheet }
    | { cardId: string; checkoutSheet: CashbackCheckoutSheet }
>;

function transformToCheckoutSheet(sheet: InitPaymentSheet): CashbackCheckoutSheet {
    return {
        merchantId: sheet.merchant.id,
        cartTotal: sheet.order.total.amount,
        currencyCode: sheet.currencyCode,
    };
}

function isPaymentSheet(sheet: InitPaymentSheet): boolean {
    return Boolean(
        sheet.merchant.name &&
            sheet.paymentMethods?.some((method) => 'gateway' in method && method.gateway),
    );
}

export function loadCashback({
    sheet,
    cardId,
}: GetCashbackParams): Promise<ApiResponseSuccess<Response>> {
    const url = '/api/v1/cashback';

    if (isPaymentSheet(sheet)) {
        const payload: CashbackPayload = {
            cardId,
            sheet,
        };

        return send.post(url, { ...payload });
    }

    const payload: CashbackPayload = {
        cardId,
        checkoutSheet: transformToCheckoutSheet(sheet),
    };

    return send.post(url, { ...payload });
}
