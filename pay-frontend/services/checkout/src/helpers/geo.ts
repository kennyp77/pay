/**
 * @fileoverview
 * Функции для работы с geo-объектами и их координатами
 * Много полезного есть тут https://www.movable-type.co.uk/scripts/latlong.html
 */
import shuffle from '@tinkoff/utils/array/shuffle';
import { findMinIndex } from '@trust/utils/array';

import {
    getMidpoint,
    getPointByDistance,
    getDistance,
    getDistanceWeight,
    deg2rad,
    getRectByBounds,
    getBoundsBySides,
} from '../lib/geo';

/**
 * Нормализация точности координат — приведение к минимальной
 * Нужна т.к. карта и геокодер отдают координаты разной точности
 * И происходит перерендер карты, если передать в нее слишком точные координаты
 */
export const normalizePoint = (point: Sdk.GeoPoint): Sdk.GeoPoint => {
    const latitude = Number(point.latitude.toFixed(10));
    const longitude = Number(point.longitude.toFixed(10));

    return { latitude, longitude };
};

export const normalizeBounds = (bounds: Sdk.GeoBounds): Sdk.GeoBounds => {
    const ne = normalizePoint(bounds.ne);
    const sw = normalizePoint(bounds.sw);

    return { ne, sw };
};

/**
 * Находит центр окна
 */
export function getCenterByBounds(bounds: Checkout.MapBounds): Sdk.GeoPoint {
    return getMidpoint(bounds.ne, bounds.sw);
}

/**
 * Расширяет границы в заданное кол-во раз
 */
export function expandBounds(bounds: Checkout.MapBounds, maxSide: number): Checkout.MapBounds {
    const geoRect = getRectByBounds(bounds);
    const hor = getDistance(geoRect.ne, geoRect.nw);
    const ver = getDistance(geoRect.ne, geoRect.se);

    const minSide = maxSide * (hor > ver ? ver / hor : hor / ver);

    const halfHor = (hor > ver ? maxSide : minSide) * 0.5;
    const halfVer = (hor > ver ? minSide : maxSide) * 0.5;

    const midPoint = getCenterByBounds(bounds);
    const n = getPointByDistance(midPoint, 0, halfVer);
    const e = getPointByDistance(midPoint, 90, halfHor);
    const s = getPointByDistance(midPoint, 180, halfVer);
    const w = getPointByDistance(midPoint, 270, halfHor);

    const nextBounds = getBoundsBySides({ n, e, s, w });

    return normalizeBounds(nextBounds);
}

/**
 * Проверяет что точка входит в границы
 */
export function isInnerPoint(bounds: Checkout.MapBounds, point: Checkout.MapPoint): boolean {
    const { latitude, longitude } = point;

    const neLat = bounds.ne.latitude;
    const neLon = bounds.ne.longitude;
    const swLat = bounds.sw.latitude;
    const swLon = bounds.sw.longitude;

    return latitude <= neLat && latitude >= swLat && longitude <= neLon && longitude >= swLon;
}

/**
 * Проверяет что одни границы входят в другие
 *
 * TODO: Пофиксить для работы на границе 180/-180
 */
export function isInnerBounds(
    innerBounds: Checkout.MapBounds,
    outerBounds: Checkout.MapBounds,
): boolean {
    const neLatInner = innerBounds.ne.latitude;
    const neLonInner = innerBounds.ne.longitude;
    const swLatInner = innerBounds.sw.latitude;
    const swLonInner = innerBounds.sw.longitude;

    const neLatOuter = outerBounds.ne.latitude;
    const neLonOuter = outerBounds.ne.longitude;
    const swLatOuter = outerBounds.sw.latitude;
    const swLonOuter = outerBounds.sw.longitude;

    const isInnerNe = neLatOuter >= neLatInner && neLonOuter >= neLonInner;
    const isInnerSw = swLatOuter <= swLatInner && swLonOuter <= swLonInner;

    return isInnerNe && isInnerSw;
}

/**
 * Выбирает центральную точку из массива точек
 * Для этого считается плотность точек и берется точка наиболее приближенная к другим объектам
 */
export function getCenterByPoints(allPoints: Checkout.MapPoint[]): null | Checkout.MapPoint {
    if (!allPoints.length) {
        return null;
    }

    // На большом массиве, считать выйдет оч дорого.
    // Берем рандомные 100 и ищем центр среди них
    const points = shuffle(allPoints).slice(-100);
    const weights = points.map(() => 0);

    for (let w = 0; w < weights.length; w++) {
        for (let p = 0; p < points.length; p++) {
            // За вес точки взято растояние до других точек
            // Чем больше точек вокруг, тем меньше вес (суммарное расстояние до них)
            weights[w] += getDistanceWeight(points[w], points[p]);
        }
    }

    const minWeightIdx = findMinIndex(weights);

    return minWeightIdx >= 0 ? normalizePoint(points[minWeightIdx]) : null;
}

/**
 * Вычисляет границы на основе массива точек
 *
 * TODO: Пофиксить для работы на границе 180/-180
 */
export function getBoundsByPoints(points: Checkout.MapPoint[]): null | Checkout.MapBounds {
    if (!points.length) {
        return null;
    }

    const latList = points.map((point) => point.latitude);
    const lonList = points.map((point) => point.longitude);

    const latMin = latList.reduce((min, lat) => Math.min(lat, min), latList[0]);
    const latMax = latList.reduce((max, lat) => Math.max(lat, max), latList[0]);

    const lonMin = lonList.reduce((min, lat) => Math.min(lat, min), lonList[0]);
    const lonMax = lonList.reduce((max, lat) => Math.max(lat, max), lonList[0]);

    return normalizeBounds({
        ne: { latitude: latMax, longitude: lonMax },
        sw: { latitude: latMin, longitude: lonMin },
    });
}

/**
 * Функция строит окружность из переданных точек
 */
const radiusLong = 0.00005;
const radiusLat = 0.000095;

// TODO: Убрать в helpers/pickup
export function pointsToRound<T extends Checkout.StructureWithCoordinates>(pickupPoints: T[]): T[] {
    const length = pickupPoints.length;

    return pickupPoints.map((point, index) => {
        const diffLatitude = radiusLong * Math.sin(deg2rad((360 / length) * index));
        const diffLongitude = radiusLat * Math.cos(deg2rad((360 / length) * index));

        const { latitude, longitude } = point.coordinates;

        return {
            ...point,
            coordinates: normalizePoint({
                latitude: latitude + diffLatitude,
                longitude: longitude + diffLongitude,
            }),
        };
    });
}

export const isNullBounds = (bounds: Checkout.MapBounds): boolean => {
    const neLat = bounds.ne.latitude;
    const neLon = bounds.ne.longitude;
    const swLat = bounds.sw.latitude;
    const swLon = bounds.sw.longitude;

    return !neLat && !neLon && !swLat && !swLon;
};
