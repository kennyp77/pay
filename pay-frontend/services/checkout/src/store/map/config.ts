import PinIconHref from '../../components/icons/assets-non-inline/pin.svg';
import SmallTailRedIconHref from '../../components/icons/assets-non-inline/small-tail-red.svg';
import SmallTailIconHref from '../../components/icons/assets-non-inline/small-tail.svg';
import { MapLayoutVariant } from '../../components/layout/types';

const SIDEBAR_OFFSET = 383 + 16 + 16;

// NB: Начальная позиция или должна быть такая, что в ходе карты ее положение точно поменяется
//     Местами логика завязана на изменние границ карты, и мы получаем ошибку, если карта не меняется
export const MAP_INITIAL_CENTER: Sdk.GeoPoint = { latitude: 55.752518, longitude: 37.622971 };
export const MAP_INITIAL_ZOOM: YMaps.MapZoom = 5; // сделано специально маленьким

export const MAP_SUGGEST_ZOOM: YMaps.MapZoom = 11;
export const MAP_SUGGEST_CITY_ZOOM: YMaps.MapZoom = 12;
export const MAP_SUGGEST_STREET_ZOOM: YMaps.MapZoom = 14;
export const MAP_SUGGEST_ADDRESS_ZOOM: YMaps.MapZoom = 16;
export const MAP_ADDRESS_ZOOM: YMaps.MapZoom = 17;

export const DESKTOP_LAYOUT_MARGIN: YMaps.MapMargin = [0, 0, 0, SIDEBAR_OFFSET];

export const TOUCH_SHORT_SHORT_LAYOUT_MARGIN: YMaps.MapMargin = [64, 0, 76, 0];
export const TOUCH_SHORT_HIGH_LAYOUT_MARGIN: YMaps.MapMargin = [64, 0, 400, 0];
export const TOUCH_HIGH_SHORT_LAYOUT_MARGIN: YMaps.MapMargin = [126, 0, 76, 0];
export const TOUCH_HIGH_HIGH_LAYOUT_MARGIN: YMaps.MapMargin = [126, 0, 400, 0];

export enum PlacemarkVariant {
    pin = 'PIN',
    smallTail = 'SMALL_TAIL',
    smallTailRed = 'SMALL_TAIL_RED',
}

export const PLACEMARK_CONFIGS: Record<PlacemarkVariant, YMaps.PlacemarkOptions> = {
    [PlacemarkVariant.pin]: {
        iconImageHref: PinIconHref as unknown as string,
        iconImageSize: [46, 82],
        iconImageOffset: [-23, -82],
    },
    [PlacemarkVariant.smallTail]: {
        iconImageHref: SmallTailIconHref as unknown as string,
        iconImageSize: [32, 38],
        iconImageOffset: [-16, -38],
    },
    [PlacemarkVariant.smallTailRed]: {
        iconImageHref: SmallTailRedIconHref as unknown as string,
        iconImageSize: [32, 38],
        iconImageOffset: [-16, -38],
    },
};

export const MAP_LAYOUT_VARIANT_MARGINS: Record<MapLayoutVariant, YMaps.MapMargin> = {
    [MapLayoutVariant.TouchShortShort]: TOUCH_SHORT_SHORT_LAYOUT_MARGIN,
    [MapLayoutVariant.TouchShortHigh]: TOUCH_SHORT_HIGH_LAYOUT_MARGIN,
    [MapLayoutVariant.TouchHighShort]: TOUCH_HIGH_SHORT_LAYOUT_MARGIN,
    [MapLayoutVariant.TouchHighHigh]: TOUCH_HIGH_HIGH_LAYOUT_MARGIN,
    [MapLayoutVariant.Desktop]: DESKTOP_LAYOUT_MARGIN,
};
