import _pick from 'lodash/pick';

import { PickupOption, GeoBounds } from '../typings';

import { loadPickupPoints, loadPickupPointInfo, BasePickupPoint } from './_shared/pickup';

export { sharedPickupOptions as pickupOptions } from './_shared/pickup';

const lessInfoPoints = (point: PickupOption): PickupOption =>
    _pick(point, ['pickupPointId', 'location', 'title', 'address', 'provider']);

function toDate(timestamp: number) {
    return new Date(timestamp).toISOString().split('T')[0];
}

function toPickupOption(base: BasePickupPoint): PickupOption {
    const option: PickupOption = {
        pickupPointId: base.id,
        title: base.title,
        provider: base.provider ? 'PICKPOINT' : 'IN_STORE',
        address: base.address,
        location: base.coordinates,
        amount: base.amount,
        storagePeriod: base.storagePeriod,
        phones: base.info?.contacts,
        description: base.info?.description,
    };

    if (base.deliveryDate) {
        option.fromDate = toDate(base.deliveryDate);
    }

    if (base.info?.schedule) {
        option.schedule = base.info.schedule.map((item) => ({
            label: item.label,
            toTime: item.timeTo,
            fromTime: item.timeFrom,
        }));
    }

    return option;
}

export async function loadPickupOptions(
    bounds: GeoBounds,
    answerType: string,
): Promise<undefined | null | PickupOption[]> {
    const use20k = answerType === 'points_20k';

    if (answerType === 'empty') {
        return [];
    }

    if (answerType === 'no_response') {
        return null;
    }

    const points = await loadPickupPoints(bounds, use20k).then((points) =>
        points.map(toPickupOption),
    );

    if (answerType === 'points_20k') {
        // Для 20к только данные для карты
        return points.map(lessInfoPoints);
    }

    if (answerType === 'points_5') {
        // Для 5 точек отдаем всю инфу
        return points;
    }

    if (answerType === 'equal_points') {
        return points
            .map(lessInfoPoints)
            .map((point) => ({ ...point, location: points[0].location }));
    }

    return undefined;
}

export async function loadPickupOptionDetails(
    pickupOptionId: string,
    answerType: string,
): Promise<undefined | PickupOption> {
    const use20k = answerType === 'points_20k';

    const point = await loadPickupPointInfo(pickupOptionId, use20k);

    if (point) {
        return toPickupOption(point);
    }

    return undefined;
}
