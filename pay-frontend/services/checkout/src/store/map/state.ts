import { asyncData } from '@trust/utils/async';

import { USER_LOCATION_COORDS } from '../../config';

import { DESKTOP_LAYOUT_MARGIN, MAP_INITIAL_ZOOM } from './config';

export enum MapBehavior {
    Drag = 'drag',
    ScrollZoom = 'scrollZoom',
    DblClickZoom = 'dblClickZoom',
    MultiTouch = 'multiTouch',
    RightMouseButtonMagnifier = 'rightMouseButtonMagnifier',
    LeftMouseButtonMagnifier = 'leftMouseButtonMagnifier',
}

export enum MapLayoutVariant {
    Desktop = 'desktop',
    TouchShortShort = 'touch-short-short',
    TouchShortHigh = 'touch-short-high',
    TouchHighShort = 'touch-high-short',
    TouchHighHigh = 'touch-high-high',
}

export interface MapState {
    sdk: Async.Data<void>;
    inactive: boolean;
    visible: boolean;
    center: Checkout.MapPoint;
    zoom: Checkout.MapZoom;
    bounds: Checkout.MapBounds;
    margin: YMaps.MapMargin;
    behaviors: MapBehavior[];
    pin: Checkout.MapPinState;
    tooltip: Checkout.MapTooltipState;
    placemarks: Checkout.MapPlacemark[];
}

export const mapInitialState: MapState = {
    sdk: asyncData.initial(),
    visible: false,
    inactive: false,
    center: USER_LOCATION_COORDS,
    zoom: MAP_INITIAL_ZOOM,
    bounds: {
        ne: { latitude: 0, longitude: 0 },
        sw: { latitude: 0, longitude: 0 },
    },
    margin: DESKTOP_LAYOUT_MARGIN,
    behaviors: [
        MapBehavior.Drag,
        MapBehavior.ScrollZoom,
        MapBehavior.DblClickZoom,
        MapBehavior.MultiTouch,
    ],
    pin: { visible: false },
    tooltip: { visible: false },
    placemarks: [],
};
