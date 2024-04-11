import memoizeOne from '@tinkoff/utils/function/memoize/one';
import { GeoBounds, GeoPoint, PickupInfo, PickupPoint } from '@yandex-pay/sdk/src/typings';

import pickPoints5 from 'data/pickpoints/pick-point-5';

const loadPickPoints20k = memoizeOne(async (): Promise<PickupPoint[]> => {
    const { default: points } = await import(
        // @ts-ignore
        /* webpackChunkName: "points" */ '../data/pickpoints/pickup-points-20k'
    );

    return points;
});

export function isPointInBounds(bounds: GeoBounds, point: GeoPoint): boolean {
    const { latitude, longitude } = point;
    const { ne, sw } = bounds;

    const insideLat = ne.latitude >= latitude && latitude >= sw.latitude;
    const insideLon = ne.longitude >= longitude && longitude >= sw.longitude;

    return insideLat && insideLon;
}

export function getPointsInBounds(bounds: GeoBounds, points: PickupPoint[]): PickupPoint[] {
    return points.filter((point) => isPointInBounds(bounds, point.coordinates));
}

export async function loadPickPoints(
    bounds: GeoBounds,
    answerType: string,
    fullData: boolean = false,
): Promise<undefined | PickupPoint[]> {
    const createMapper = (fullData: boolean) => {
        return fullData
            ? (pickPoint: PickupPoint) => pickPoint
            : (pickPoint: PickupPoint) => ({
                  id: pickPoint.id,
                  coordinates: pickPoint.coordinates,
                  label: pickPoint.label,
                  address: pickPoint.address,
              });
    };

    if (answerType === 'points_5') {
        // Для 5 точек отдаем всю инфу
        return getPointsInBounds(bounds, pickPoints5);
    }

    if (answerType === 'points_20k') {
        // Для 20к только данные для карты
        return (await loadPickPoints20k().then((points) => getPointsInBounds(bounds, points))).map(
            createMapper(fullData),
        );
    }

    if (answerType === 'empty') {
        return [];
    }

    if (answerType === 'equal_points') {
        const points = pickPoints5;

        return points
            .map((p) => ({ ...p, coordinates: points[0].coordinates }))
            .map(createMapper(fullData));
    }

    return undefined;
}

export async function loadPickPointsByInfo(
    info: PickupInfo,
    answerType: string,
): Promise<undefined | PickupPoint> {
    if (answerType === 'points_5') {
        return pickPoints5.filter((pickPoint) => pickPoint.id === info.pickupPointId)[0];
    }

    if (answerType === 'points_20k') {
        return loadPickPoints20k().then(
            (points) => points.filter((pickPoint) => pickPoint.id === info.pickupPointId)[0],
        );
    }

    return undefined;
}
