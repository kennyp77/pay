import { Order } from '@yandex-pay/sdk/src/typings';

export const convertOrder = (order: Order): Order => {
    return {
        id: order.id,
        total: order.total,
        items: order.items.map((item) => ({
            id: item.id,
            amount: item.amount,
            quantity: item.quantity,
        })),
    };
};
