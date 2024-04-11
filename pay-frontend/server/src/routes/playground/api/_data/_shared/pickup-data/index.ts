import pickPoints5, { BasePickupPoint } from './pickup-points-5';

export type { BasePickupPoint } from './pickup-points-5';

interface GeoPoint {
    latitude: number;
    longitude: number;
}
interface GeoBounds {
    sw: GeoPoint;
    ne: GeoPoint;
}

function memo<T>(callback: () => T): () => T {
    let res: T;

    return () => {
        !res && (res = callback());

        return res;
    };
}

const loadPickPoints20k = memo<Promise<BasePickupPoint[]>>(async () => {
    const { default: points } = await import(
        // @ts-ignore
        /* webpackChunkName: "points" */ './pickup-points-20k'
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

function getPointsInBounds(bounds: GeoBounds, points: BasePickupPoint[]): BasePickupPoint[] {
    return points.filter((point) => isPointInBounds(bounds, point.coordinates));
}

export async function loadPickupPoints(
    bounds: GeoBounds,
    use20k: boolean = false,
): Promise<BasePickupPoint[]> {
    if (use20k) {
        return loadPickPoints20k().then((points) => getPointsInBounds(bounds, points));
    }

    return getPointsInBounds(bounds, pickPoints5);
}

export async function loadPickupPointInfo(
    id: string,
    use20k: boolean = false,
): Promise<undefined | BasePickupPoint> {
    if (use20k) {
        return loadPickPoints20k().then((points) =>
            points.find((pickPoint) => pickPoint.id === id),
        );
    }

    return pickPoints5.find((pickPoint) => pickPoint.id === id);
}
