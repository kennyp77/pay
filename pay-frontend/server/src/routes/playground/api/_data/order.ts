import { amountDiv, amountMul, amountSum } from '../helpers/amount';
import { OrderCart, OrderItem, OrderTotal, OrderCoupon, PayloadItem, Coupon } from '../typings';

import { validateCoupon } from './_shared/coupons';
import { OrderMetadata } from './_shared/metadata';
import { baseOrderItems, BaseOrderItem } from './_shared/order';

const baseOrderItemsMap = baseOrderItems.reduce((res, item) => {
    res[item.id] = item;

    return res;
}, {} as Record<string, BaseOrderItem>);

interface TransformConfig {
    receipt: boolean;
}

function toOrderItem(base: BaseOrderItem, config: TransformConfig): OrderItem {
    const item: OrderItem = {
        productId: base.id,
        total: base.amount,
        title: base.label,
        quantity: {
            count: base.quantity.count,
        },
    };

    if (Number(base.quantity.count) > 1) {
        item.total = base.amount;
        item.unitPrice = amountDiv(base.amount, base.quantity.count);
    }

    if (config.receipt) {
        item.receipt = base.receipt;
    }

    return item;
}

const getOrderItemsByPayload = (
    payloadItems: PayloadItem[],
    metadata: OrderMetadata,
): OrderItem[] => {
    const items = payloadItems.map(({ productId }) => baseOrderItemsMap[productId]).filter(Boolean);

    if (items.length !== payloadItems.length) {
        throw new Error(`Unable to found some items`);
    }

    return items.map((item) => toOrderItem(item, { receipt: metadata.receipt.enabled }));
};

const applyCoupons = (userCoupons: Coupon[], items: OrderItem[]): [OrderCoupon[], OrderItem[]] => {
    const coupons: OrderCoupon[] = [];

    for (const coupon of userCoupons) {
        const { error, discount } = validateCoupon(coupon.value, '1');

        if (error) {
            coupons.push({
                status: error.status,
                value: coupon.value,
                description: error.message,
            });
        }

        if (discount) {
            coupons.push({
                status: 'VALID',
                value: coupon.value,
                description: `Скидка ${discount * 100}%`,
            });

            for (const item of items) {
                item.subtotal = item.subtotal || item.total;

                item.total = amountMul(item.subtotal, 1 - discount);
            }
        }
    }

    return [coupons, items];
};

function getTotal(items: OrderItem[]): OrderTotal {
    return {
        label: 'Total',
        amount: items.reduce((res, item) => amountSum(res, item.total), '0'),
    };
}

export const getOrderCart = (
    metadata: OrderMetadata,
    payloadItems: PayloadItem[],
    userCoupons?: Coupon[],
): OrderCart => {
    const [coupons, items] = applyCoupons(
        userCoupons || [],
        getOrderItemsByPayload(payloadItems, metadata),
    );

    const cart: OrderCart = {
        items,
        total: getTotal(items),
    };

    if (coupons.length) {
        cart.coupons = coupons;
    }

    return cart;
};
