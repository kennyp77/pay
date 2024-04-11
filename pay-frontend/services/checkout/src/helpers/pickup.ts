import { logWarn } from '@trust/rum';
import { arrayToObj } from '@trust/utils/array';

import {
    getCenterByPoints,
    getBoundsByPoints,
    expandBounds,
    isInnerBounds,
    pointsToRound,
} from './geo';
import { innerSize } from './window';

// NB: Временное решение, после нужно вернуть 2 и 120
const EXPAND_FETCH_BOUNDS_K = 1;
const MAX_FETCH_DISTANCE = 60;
const MIN_FETCH_ZOOM = 14;

const MAX_POINTS_LENGTH = 2000;

// Расстояние в км на пиксель
const YMAP_DISTANCE_BY_ZOOM: Array<[Checkout.MapZoom, number]> = [
    [8, 0.34],
    [9, 0.172],
    [10, 0.086],
    [11, 0.043],
    [12, 0.021],
    [13, 0.01],
    [MIN_FETCH_ZOOM, 0.005],
];

const getCoordinateKey = (coord: Checkout.MapPoint): string => {
    return `${coord.latitude.toFixed(4)}-${coord.longitude.toFixed(4)}`;
};

export const toPointsWithUniqueCoordinates = <T extends Checkout.StructureWithCoordinates>(
    pickupPoints: T[],
): T[] => {
    const uniquePoints: T[] = [];
    const uniqueCoords: string[] = [];
    const nonUniquePoints = new Map<string, T[]>();

    pickupPoints.forEach((point) => {
        const key = getCoordinateKey(point.coordinates);

        if (uniqueCoords.includes(key)) {
            const arr = nonUniquePoints.get(key) || [];

            arr.push(point);

            nonUniquePoints.set(key, arr);
        } else {
            uniquePoints.push(point);
            uniqueCoords.push(key);
        }
    });

    nonUniquePoints.forEach((points) => {
        uniquePoints.push(...pointsToRound(points));
    });

    return uniquePoints;
};

/**
 * Вычисляем минимальный зум
 * Он отличается для окон разного размера
 */
export function getMinZoomForFetch(): Checkout.MapZoom {
    const maxSide = Math.max(...innerSize());
    const maxDistance = MAX_FETCH_DISTANCE / EXPAND_FETCH_BOUNDS_K;

    const ymapDistance = YMAP_DISTANCE_BY_ZOOM.find(
        ([, pxDistance]) => maxSide * pxDistance <= maxDistance,
    );

    return ymapDistance ? ymapDistance[0] : MIN_FETCH_ZOOM;
}

export function getBoundsForFetch(bounds: Checkout.MapBounds): Checkout.MapBounds {
    return expandBounds(bounds, MAX_FETCH_DISTANCE);
}

export function isBoundsLoaded(
    nextBounds: Checkout.MapBounds,
    loadedBounds: Checkout.MapBounds,
): boolean {
    return isInnerBounds(nextBounds, loadedBounds);
}

export function getCenterByInitialPoints(
    pickupPoints: Checkout.PickupPoint[],
): null | Checkout.MapPoint {
    const points = pickupPoints.map((point) => point.coordinates);

    return getCenterByPoints(points);
}

export function getBoundsByInitialPoints(
    pickupPoints: Checkout.PickupPoint[],
): null | Checkout.MapBounds {
    const points = pickupPoints.map((point) => point.coordinates);

    return getBoundsByPoints(points);
}

export function parsePickupPoints(
    allOldPoints: Sdk.PickupPoint[],
    allNewPoints: Sdk.PickupPoint[],
): Sdk.PickupPoint[] {
    // Отбираем только точки с координатами
    const newPoints = allNewPoints.filter((point) => point.coordinates);

    if (newPoints.length !== allNewPoints.length) {
        logWarn(new Error('pickupPointsWithoutCoordinates'), {
            count: newPoints.length - newPoints.length,
        });
    }

    const newPointsIdsMap = arrayToObj(newPoints, 'id', 'id');

    // Отбрасываем точки если их больше MAX_POINTS_LENGTH
    // Важно! — старые точки в начале массива, отбрасываем их первыми
    const oldPoints = allOldPoints
        .filter((point) => !newPointsIdsMap[point.id])
        .slice(newPoints.length - MAX_POINTS_LENGTH);

    return [...oldPoints, ...newPoints];
}
