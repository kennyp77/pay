import { L } from 'ts-toolbelt';
// eslint-disable-next-line import/no-unresolved
import * as _ymaps from 'yandex-maps';

type Top = number;
type Left = number;
type Bottom = number;
type Right = number;

declare global {
    interface Window {
        ymaps: typeof _ymaps;
    }

    namespace YMaps {
        type Map = _ymaps.Map;
        type MapState = _ymaps.IMapState;
        type MapOptions = _ymaps.IMapOptions;
        type MapZoom = L.KeySet<1, 19>;
        type MapMargin = [Top, Left, Bottom, Right];

        type GeoObject = _ymaps.IGeoObject;

        type Clusterer = _ymaps.Clusterer;
        type ClustererOptions = _ymaps.IClustererOptions;

        type Placemark = _ymaps.Placemark;
        type PlacemarkOptions = _ymaps.IPlacemarkOptions;

        type Event = _ymaps.Event;
    }
}
