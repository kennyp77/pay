/**
 * @fileoverview
 * Функции для работы с geo-объектами и их координатами
 * Много полезного есть тут https://www.movable-type.co.uk/scripts/latlong.html
 */

interface GeoRect {
    sw: Checkout.MapPoint;
    ne: Checkout.MapPoint;
    nw: Checkout.MapPoint;
    se: Checkout.MapPoint;
}

interface GeoSides {
    n: Checkout.MapPoint;
    e: Checkout.MapPoint;
    s: Checkout.MapPoint;
    w: Checkout.MapPoint;
}

const EARTH_R = 6371; // Radius of the earth in km

export const deg2rad = (deg: number) => (deg * Math.PI) / 180;
export const rad2deg = (rad: number) => rad * (180 / Math.PI);

/**
 * Функция возвращает "размер"/вес расстояния
 * Для расчета растояния, нужно делать `Math.sqrt(x*x + y*y) * R`, но это дорого
 * Для понимания удаленности двух объектов, можно опустить извлечение корня
 */
export function getDistanceWeight(pointA: Checkout.MapPoint, pointB: Checkout.MapPoint): number {
    const latA = deg2rad(pointA.latitude);
    const lonA = deg2rad(pointA.longitude);
    const latB = deg2rad(pointB.latitude);
    const lonB = deg2rad(pointB.longitude);

    const x = (lonB - lonA) * Math.cos((latA + latB) / 2);
    const y = latB - latA;

    return x * x + y * y;
}

/**
 * Возвращает расстояние в km между точками
 */
export function getDistance(pointA: Checkout.MapPoint, pointB: Checkout.MapPoint): number {
    const latA = deg2rad(pointA.latitude);
    const lonA = deg2rad(pointA.longitude);
    const latB = deg2rad(pointB.latitude);
    const lonB = deg2rad(pointB.longitude);
    const dLat = latB - latA;
    const dLon = lonB - lonA;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(latA) * Math.cos(latB) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_R * c;
}

/**
 * Возвращает центр между двумя точками
 */
export function getMidpoint(
    pointA: Checkout.MapPoint,
    pointB: Checkout.MapPoint,
): Checkout.MapPoint {
    const latA = deg2rad(pointA.latitude);
    const lonA = deg2rad(pointA.longitude);
    const latB = deg2rad(pointB.latitude);
    const lonB = deg2rad(pointB.longitude);

    const Bx = Math.cos(latB) * Math.cos(lonB - lonA);
    const By = Math.cos(latB) * Math.sin(lonB - lonA);

    const latC = Math.atan2(
        Math.sin(latA) + Math.sin(latB),
        Math.sqrt((Math.cos(latA) + Bx) * (Math.cos(latA) + Bx) + By * By),
    );
    const lonC = lonA + Math.atan2(By, Math.cos(latA) + Bx);

    return { latitude: rad2deg(latC), longitude: rad2deg(lonC) };
}

/**
 * Возвращает центр между двумя точками
 */
export function getPointByDistance(
    pointA: Checkout.MapPoint,
    angle: number,
    distance: number,
): Checkout.MapPoint {
    const brng = deg2rad(angle);
    const latA = deg2rad(pointA.latitude);
    const lonA = deg2rad(pointA.longitude);

    const dst = distance / EARTH_R;

    const latB = Math.asin(
        Math.sin(latA) * Math.cos(dst) + Math.cos(latA) * Math.sin(dst) * Math.cos(brng),
    );

    const lonB =
        lonA +
        Math.atan2(
            Math.sin(brng) * Math.sin(dst) * Math.cos(latA),
            Math.cos(dst) - Math.sin(latA) * Math.sin(latB),
        );

    return { latitude: rad2deg(latB), longitude: rad2deg(lonB) };
}

export function getRectByBounds(bounds: Checkout.MapBounds): GeoRect {
    return {
        ne: bounds.ne,
        sw: bounds.sw,
        nw: { latitude: bounds.ne.latitude, longitude: bounds.sw.longitude },
        se: { latitude: bounds.sw.latitude, longitude: bounds.ne.longitude },
    };
}

export function getBoundsBySides(sides: GeoSides): Checkout.MapBounds {
    return {
        ne: { latitude: sides.n.latitude, longitude: sides.e.longitude },
        sw: { latitude: sides.s.latitude, longitude: sides.w.longitude },
    };
}
