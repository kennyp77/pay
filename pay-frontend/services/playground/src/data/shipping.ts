import {
    sharedShippingOptions,
    BaseShippingItem,
    ShippingOption,
} from '@yandex-pay/playground-data/shipping';
import { ShippingOption as ShippingItem } from '@yandex-pay/sdk/src/typings';

const toUnixTs = (timestamp: number): number => Math.floor(Number(timestamp) / 1000);

function toSippingOption(base: BaseShippingItem): ShippingItem {
    const option: ShippingItem = {
        id: base.id,
        amount: base.amount,
        provider: base.provider,
        category: base.category.toLowerCase() as ShippingItem['category'],
    };

    if (base.fromDate) {
        option.date = toUnixTs(base.fromDate);
    }

    if (base.fromTime && base.toTime) {
        option.time = {
            from: toUnixTs(base.fromTime),
            to: toUnixTs(base.toTime),
        };
    }

    return option;
}

export const shippingOptions: ShippingOption<ShippingItem>[] = sharedShippingOptions.map(
    (options) => ({
        ...options,
        items: options.items.map(toSippingOption),
    }),
);
