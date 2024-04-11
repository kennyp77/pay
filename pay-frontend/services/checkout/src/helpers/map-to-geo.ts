import { normalizePoint } from './geo';

type YMapPoint = number[];
type YMapBounds = YMapPoint[];

export function convertMapPointToGeoPoint([latitude, longitude]: YMapPoint): Checkout.MapPoint {
    return normalizePoint({ latitude, longitude });
}

export function convertMapBoundsToGeoBounds([sw, ne]: YMapBounds): Checkout.MapBounds {
    return {
        ne: convertMapPointToGeoPoint(ne),
        sw: convertMapPointToGeoPoint(sw),
    };
}
