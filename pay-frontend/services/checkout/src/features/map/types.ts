import { ReactNode } from 'react';

export type Layout =
    | 'desktop'
    | 'touch-short-short'
    | 'touch-short-high'
    | 'touch-high-short'
    | 'touch-high-high';

export type Latitude = number;
export type Longitude = number;

export type MapMargin = [number, number, number, number];
export type MapPoint = [Latitude, Longitude] | number[];
export type MapBounds = [MapPoint, MapPoint];

export interface PlacemarkOptions {
    iconHref: string;
    iconSize: [number, number];
    iconOffset: [number, number];
}
export interface PlacemarkEvent {
    placemark: Placemark;
    event: any;
}
export interface Placemark {
    coordinates: {
        latitude: Latitude;
        longitude: Longitude;
    };
    onClick?: Sys.CallbackFn1<PlacemarkEvent>;
}

export interface MapContextState {
    layout: Layout;
    zoom: number;
    center: MapPoint;
    visible: boolean;
    interactive: boolean;
    pin: {
        visible: boolean;
    };
    tooltip: {
        visible: boolean;
        helper?: ReactNode;
        title?: ReactNode;
    };
    placemarks: Placemark[];
    placemarkOptions: PlacemarkOptions;
    useCluster: boolean;
    bounds: MapBounds;
}
