import { PAYMENT_SHEET_META_SIZE } from '../config';
import { assert } from '../lib/assert';
import { hasProp } from '../lib/is';
import {
    PaymentDataV3,
    UpdatePaymentDataV3,
    InitPaymentData,
    UpdatePaymentData,
    PaymentSheet,
} from '../typings';

/**
 * Конвертер для формата болтификации в наш PaymentSheet.
 * Сделано чтобы мерчи использующие болтификацию имели единый формат овтета на сервере и клиенте.
 *
 * Сумма рассчитываема на клиенте тут не является критом
 * т.к. используется только для показа Кешбэка плюсов (на форме total запрашивается у мерча)
 */
function cartToOrder(cart: PaymentDataV3['cart']): undefined | InitPaymentData['order'] {
    try {
        const orderItems = cart.items.map((item) => ({
            id: item.productId,
            amount: item.total,
            quantity: item.quantity,
        }));

        const totalAmount = orderItems
            .reduce((res, item) => res + (Number(item.amount) || 0), 0)
            .toFixed(2);

        return {
            id: cart.externalId,
            items: orderItems,
            total: { amount: totalAmount },
        };
    } catch (err) {
        return undefined;
    }
}

export function isV3PaymentData(sheet: InitPaymentData | PaymentDataV3): sheet is PaymentDataV3 {
    return Boolean(sheet.version === 3);
}

export function isInitPaymentDataWithCheckout(
    sheet: InitPaymentData | PaymentDataV3,
): sheet is InitPaymentData {
    if (isV3PaymentData(sheet)) {
        return false;
    }

    const { requiredFields } = sheet as PaymentSheet;

    return Boolean(
        requiredFields && (requiredFields.shippingContact || requiredFields.shippingTypes),
    );
}

export function assertPaymentDataV3(sheet: InitPaymentData | PaymentDataV3): void {
    if (isV3PaymentData(sheet) && hasProp('metadata', sheet)) {
        assert(typeof sheet.metadata === 'string', 'sheet.metadata must be a string');
        assert(
            encodeURIComponent(sheet.metadata).length <= PAYMENT_SHEET_META_SIZE,
            'sheet.metadata is too long',
        );
    }
}

export function toInitPaymentData(sheet: PaymentDataV3): null | InitPaymentData {
    try {
        if (!isV3PaymentData(sheet)) {
            return null;
        }

        const paymentOrder = cartToOrder(sheet.cart);

        if (!paymentOrder) {
            return null;
        }

        return {
            env: sheet.env,
            version: sheet.version,
            merchant: {
                id: sheet.merchantId,
                name: '',
            },
            currencyCode: sheet.currencyCode,
            order: paymentOrder,
            metadata: sheet.metadata,
        };
    } catch (err) {
        return null;
    }
}

export function toUpdatePayment(sheet: UpdatePaymentDataV3): UpdatePaymentData {
    return {
        order: cartToOrder(sheet.cart),
        metadata: sheet.metadata,
    };
}
