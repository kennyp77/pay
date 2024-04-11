const normalizePointSchedule = (schedule: Sdk.PickupPointSchedule): Sdk.PickupPointSchedule => {
    return {
        label: schedule.label ?? '',
        timeFrom: schedule.timeFrom ?? '',
        timeTo: schedule.timeTo ?? '',
    };
};

const normalizePointInfo = (info: Checkout.PickupPoint['info']): Checkout.PickupPoint['info'] => {
    if (!info) {
        return undefined;
    }

    return {
        schedule: Array.isArray(info.schedule)
            ? info.schedule.map(normalizePointSchedule)
            : undefined,
        contacts: Array.isArray(info.contacts) ? info.contacts : undefined,
        description: info.description ? info.description : undefined,
        tripDescription: info.tripDescription ? info.tripDescription : undefined,
    };
};

export const pickupPointsList = (rawPoints: Checkout.PickupPoint[]): Checkout.PickupPoint[] =>
    rawPoints.map((point) => {
        return {
            id: point.id,
            label: point.label ?? '',
            provider: point.provider,
            address: point.address ?? '',
            deliveryDate: point.deliveryDate ? point.deliveryDate * 1000 : undefined,
            storagePeriod: point.storagePeriod,
            amount: point.amount,
            coordinates: {
                latitude: Number(point.coordinates.latitude),
                longitude: Number(point.coordinates.longitude),
            },
            info: normalizePointInfo(point.info),
            raw: point.raw,
        };
    });
