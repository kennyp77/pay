import pick from '@tinkoff/utils/object/pick';
import {
    loadPickupPoints,
    loadPickupPointInfo,
    BasePickupPoint,
} from '@yandex-pay/playground-data/pickup';
import { GeoBounds, PickupInfo, PickupPoint } from '@yandex-pay/sdk/src/typings';

export { sharedPickupOptions as pickupOptions } from '@yandex-pay/playground-data/pickup';

const lessInfoPoints = pick(['id', 'coordinates', 'label', 'address']);

function toPickupPoint(base: BasePickupPoint): PickupPoint {
    const point: PickupPoint = {
        ...base,
        provider: base.provider as PickupPoint['provider'],
    };

    if (base.deliveryDate) {
        point.deliveryDate = (base.deliveryDate * 0.001) | 0;
    }

    return point;
}

export async function loadPickPoints(
    bounds: GeoBounds,
    answerType: string,
): Promise<undefined | PickupPoint[]> {
    const use20k = answerType === 'points_20k';

    if (answerType === 'empty') {
        return [];
    }

    const points = await loadPickupPoints(bounds, use20k).then((points) =>
        points.map(toPickupPoint),
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
            .map((point) => ({ ...point, coordinates: points[0].coordinates }));
    }

    return undefined;
}

export async function loadPickPointsByInfo(
    info: PickupInfo,
    answerType: string,
): Promise<undefined | PickupPoint> {
    const use20k = answerType === 'points_20k';

    const point = await loadPickupPointInfo(info.pickupPointId, use20k);

    if (point) {
        return toPickupPoint(point);
    }

    return undefined;
}
