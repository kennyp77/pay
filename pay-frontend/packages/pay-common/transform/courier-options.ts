import pathOr from '@tinkoff/utils/object/pathOr';
import { RenderOrderResponse, ShippingCourierOption } from '@trust/pay-api';
import { toUnixTs } from '@trust/utils/date';

const transformCategory = (category?: string): Sdk.ShippingCategory => {
    if (category && ['STANDARD', 'EXPRESS', 'TODAY'].includes(category)) {
        return category.toLowerCase() as Sdk.ShippingCategory;
    }

    return 'standart';
};

const transformProvider = (provider: string): Sdk.ShippingProvider => {
    if (['COURIER', 'CDEK', 'EMS', 'DHL'].includes(provider)) {
        return provider as Sdk.ShippingProvider;
    } else {
        return 'COURIER';
    }
};

const transformTime = (time: string, fromDate: string): number => {
    const [hours, minutes] = time.split(':');

    const date = new Date(fromDate);
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    date.setSeconds(0);

    return toUnixTs(date);
};

export const orderToShippingOptions = (order: RenderOrderResponse): Sdk.ShippingOption[] => {
    const options: ShippingCourierOption[] = pathOr(
        ['shipping', 'availableCourierOptions'],
        [],
        order,
    );

    return options.map((option) => ({
        id: option.courierOptionId,
        provider: transformProvider(option.provider),
        category: transformCategory(option.category),
        label: option.title,
        amount: option.amount,
        date: option.fromDate ? toUnixTs(new Date(option.fromDate)) : undefined,
        time:
            option.fromTime && option.toTime
                ? {
                      from: transformTime(option.fromTime, option.fromDate),
                      to: transformTime(option.toTime, option.fromDate),
                  }
                : undefined,
        raw: option,
    }));
};
