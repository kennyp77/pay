import { sharedOrderOptions, BaseOrderItem, OrderOption } from '@yandex-pay/playground-data/order';
import * as Sdk from '@yandex-pay/sdk/src/typings';

function toCartOption(base: BaseOrderItem): Sdk.OrderItem {
    return {
        ...base,
        type: base.type as Sdk.OrderItemType,
    };
}

export const orderOptions: OrderOption<Sdk.OrderItem>[] = sharedOrderOptions.map((options) => ({
    ...options,
    items: options.items.map(toCartOption),
}));
