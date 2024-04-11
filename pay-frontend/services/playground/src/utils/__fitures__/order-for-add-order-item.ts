import { Order } from '@yandex-pay/sdk/src/typings';

import { randomString } from '../random-string';

export const orderForAddOrderItem: Required<Order> = {
    id: randomString(),
    total: {
        amount: '100.00',
    },
    items: [{ label: 'Test Item 1', amount: '100' }],
};
