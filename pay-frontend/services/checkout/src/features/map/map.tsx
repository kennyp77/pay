import * as React from 'react';
import { memo, useCallback, useEffect, useRef } from 'react';

import { cn } from '@bem-react/classname';
import isEqual from '@tinkoff/utils/is/equal';
import { useDispatch, useSelector } from 'react-redux';
import { useDeepCompareEffect } from 'react-use';
import { useUniqId } from 'web-platform-alpha';

import { convertMapBoundsToGeoBounds, convertMapPointToGeoPoint } from '../../helpers/map-to-geo';
import {
    MapState,
    MapBehavior,
    getMapBehaviors,
    getMapCenter,
    getMapMargin,
    getMapPlacemarks,
    getMapVisible,
    getMapZoom,
    PLACEMARK_CONFIGS,
    getMapInactive,
    setMapState,
} from '../../store/map';

import { createCluster } from './clusterer';
import { getAddAndRemovePlacemarks } from './helpers/comparePoints';

import './map.scss';

export const cnMap = cn('Map');

// Используется для блокирования повторного вызова dispatch
// на событие изменение области просмотра карты
let skipBoundsChange = false;

export const Map = memo(function Map() {
    const instanceRef = useRef<YMaps.Map | null>(null);
    const clustererRef = useRef<YMaps.Clusterer>(createCluster());

    const dispatch = useDispatch();
    const id = useUniqId('map');
    const visible = useSelector(getMapVisible);
    const inactive = useSelector(getMapInactive);

    const center = useSelector(getMapCenter);
    const zoom = useSelector(getMapZoom);
    const margin = useSelector(getMapMargin);
    const behaviors = useSelector(getMapBehaviors);
    const placemarks = useSelector(getMapPlacemarks);

    // Событие изменения области просмотра карты
    const onBoundsChange = useCallback(
        (event: YMaps.Event) => {
            if (!instanceRef.current || skipBoundsChange) {
                return;
            }

            const nextState: Partial<MapState> = {};

            if (!isEqual(event.get('oldCenter'), event.get('newCenter'))) {
                const center = instanceRef.current.getCenter({ useMapMargin: true });

                nextState.center = convertMapPointToGeoPoint(center);
            }

            if (!isEqual(event.get('oldZoom'), event.get('newZoom'))) {
                nextState.zoom = instanceRef.current.getZoom() as YMaps.MapZoom;
            }

            if (!isEqual(event.get('oldBounds'), event.get('newBounds'))) {
                const bounds = instanceRef.current.getBounds();

                nextState.bounds = convertMapBoundsToGeoBounds(bounds);
            }

            dispatch(setMapState(nextState));
        },
        [dispatch],
    );

    // Эффект чтобы карта не исчезала при ресайзе окна
    useEffect(() => {
        setTimeout(() => {
            instanceRef.current?.container.fitToViewport();
        });
    }, [visible]);

    // Создаю инстанс карты и вещаю событие boundschange
    useEffect(() => {
        instanceRef.current = new window.ymaps.Map(
            id,
            {
                center: [center.latitude, center.longitude],
                zoom,
                margin,
                behaviors,
            },
            {
                yandexMapDisablePoiInteractivity: true,
                suppressMapOpenBlock: true,
                copyrightLogoVisible: false,
                copyrightProvidersVisible: false,
                copyrightUaVisible: false,
            },
        );

        instanceRef.current!.events.add('boundschange', onBoundsChange);
        // @ts-ignore
        instanceRef.current!.geoObjects.add(clustererRef.current);

        const geolocationControl = new window.ymaps.control.GeolocationControl({
            options: { position: { top: '50vh', right: '10px' } },
        });
        instanceRef.current!.controls.add(geolocationControl);

        return () => {
            instanceRef.current?.destroy();
        };
        // NB: Это задание первоначального состояния,
        // карта не должна тут реагировать на имзенения стейта
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, onBoundsChange]);

    // Устанавливаю margin для safe-zones
    // Сначала нужно поставить margin, потом центр
    useEffect(() => {
        instanceRef.current?.margin.setDefaultMargin(margin);
    }, [instanceRef.current, margin]);

    // Программное изменение области просмотра карты
    useDeepCompareEffect(() => {
        // skipBoundsChange = true;
        instanceRef.current?.setCenter([center.latitude, center.longitude], zoom, {
            useMapMargin: true,
        });
        // skipBoundsChange = false;
    }, [instanceRef.current, center, zoom]);

    // Включаю/Отключаю поведения карты
    useEffect(() => {
        instanceRef.current?.behaviors.disable([
            MapBehavior.Drag,
            MapBehavior.ScrollZoom,
            MapBehavior.DblClickZoom,
            MapBehavior.MultiTouch,
            MapBehavior.RightMouseButtonMagnifier,
            MapBehavior.LeftMouseButtonMagnifier,
        ]);

        instanceRef.current?.behaviors.enable(behaviors);
    }, [instanceRef.current, behaviors]);

    // Отображение placemarks в кластере
    useDeepCompareEffect(() => {
        const cluster = clustererRef.current;

        const { removePlacemarks, addPlacemarks } = getAddAndRemovePlacemarks(
            cluster.getGeoObjects(),
            placemarks,
        );

        cluster.remove(removePlacemarks);

        for (const placemark of addPlacemarks) {
            const { latitude, longitude } = placemark.coordinates;
            const yPlacemark = new window.ymaps.Placemark([latitude, longitude], placemark, {
                hasBalloon: false,
                hasHint: false,
                iconLayout: 'default#image',
                ...PLACEMARK_CONFIGS[placemark.variant],
            });

            if (placemark.onClick) {
                yPlacemark.events.add(['click'], () => placemark.onClick?.(placemark));
            }

            cluster.add(yPlacemark);
        }
    }, [instanceRef.current, clustererRef, placemarks]);

    return <div id={id} className={cnMap({ visible, inactive })} />;
});
