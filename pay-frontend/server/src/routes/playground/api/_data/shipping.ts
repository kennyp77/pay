import { ShippingItem } from '../typings';

import { sharedShippingOptions, BaseShippingItem } from './_shared/shipping';

function toDate(timestamp: number) {
    return new Date(timestamp).toISOString().split('T')[0];
}

function toTime(timestamp: number) {
    const time = new Date(timestamp).toISOString().split('T')[1].split(':');

    return `${time[0]}:${time[1]}`;
}

function toSippingItem(base: BaseShippingItem): ShippingItem {
    const option: ShippingItem = {
        courierOptionId: base.id,
        title: base.title,
        provider: base.provider,
        category: base.category,
        amount: base.amount,
        fromDate: '1970-01-01',
    };

    if (base.fromDate) {
        option.fromDate = toDate(base.fromDate);
    }

    if (base.fromTime && base.toTime) {
        option.fromTime = toTime(base.fromTime);
        option.toTime = toTime(base.toTime);
    }

    return option;
}

export const getShippingItems = (value: number): null | ShippingItem[] => {
    const option = sharedShippingOptions.find((option) => option.value === value);

    if (!option) {
        throw new Error(`Unable to found shipping option '${value}'`);
    }

    if (option.alias === 'no_response') {
        return null;
    }

    return option.items.map(toSippingItem);
};
