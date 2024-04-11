import { PickupOption } from '@trust/pay-api';
import { toUnixTs } from '@trust/utils/date';

const transformProvider = (option: PickupOption): Sdk.PickupProvider | undefined => {
    if (option.provider === 'PICKPOINT') {
        return 'pickpoint';
    }

    return undefined;
};

const transformInfo = (option: PickupOption): Sdk.PickupPoint['info'] | undefined => {
    if (!(option.phones || option.description || option.schedule)) {
        return undefined;
    }

    const info: Sdk.PickupPoint['info'] = {
        contacts: option.phones,
        description: option.description,
    };

    if (option.schedule) {
        info.schedule = option.schedule.map((item) => ({
            label: item.label,
            timeFrom: item.fromTime,
            timeTo: item.toTime,
        }));
    }

    return info;
};

const transformDeliveryDate = (option: PickupOption): number | undefined => {
    if (option.fromDate) {
        return toUnixTs(new Date(option.fromDate));
    }

    return undefined;
};

export const pickupOptionsToPickupPoints = (options: PickupOption[]): Sdk.PickupPoint[] => {
    return options.map((option) => {
        return {
            id: option.pickupPointId,
            label: option.title,
            provider: transformProvider(option),
            address: option.address,
            deliveryDate: transformDeliveryDate(option),
            storagePeriod: option.storagePeriod,
            amount: option.amount,
            coordinates: option.location,
            info: transformInfo(option),
            raw: option,
        };
    });
};
