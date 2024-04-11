import React, { memo, useEffect, useState, useRef } from 'react';

import { asyncData } from '@trust/utils/async';
import { useDispatch, useSelector } from 'react-redux';
import { useThrottleFn, useEffectOnce } from 'react-use';

import { isInnerPoint, isNullBounds, getCenterByBounds } from '../../helpers/geo';
import { getMinZoomForFetch } from '../../helpers/pickup';
import { history, Path } from '../../router';
import {
    getMapBounds,
    setMapPlacemarks,
    setMapStateBySelector,
    PlacemarkVariant,
    getMapZoom,
    getMapCenter,
} from '../../store/map';
import {
    fetchPickupPoints,
    getPickupMapState,
    getPickupPointsList,
    selectPickupPoint,
    setPickupMapState,
    getPickupPointsStatus,
} from '../../store/pickup';

import { NoPlacemarksPopup } from './components/no-placemarks-popup';

export interface PickupContainerProps {
    children: React.ReactNode;
}

const FETCH_POINTS_WAIT = 3000;
const SKIP_BOUND_UPDATES = 2;

// TODO: Добавить пересчитывать динамически, заюзать react-use/useWindowSize
const MIN_ZOOM = getMinZoomForFetch();

export const PickupContainer: React.FC<PickupContainerProps> = memo(function Pickup({
    children,
}: PickupContainerProps) {
    const dispatch = useDispatch();

    const pickupPoints = useSelector(getPickupPointsList);
    const pickupPointsStatus = useSelector(getPickupPointsStatus);
    const mapBounds = useSelector(getMapBounds);
    const mapZoom = useSelector(getMapZoom);
    const mapCenter = useSelector(getMapCenter);

    const [isEmptyPointList, setIsEmptyPointList] = useState(false);
    const [isLargeZoom, setIsLargeZoom] = useState(false);

    // NB: Костыль, но пока пойдет.
    //     На этапе инициализации, нам нужно пропустить 2 (SKIP_BOUND_UPDATES) апдейта карты
    //     1 апдейт — вызывается при инициализации компонента с текущими границами
    //     2 апдейт — вызывается при установке начального центра карты (см setMapStateBySelector)
    //     Если у нас нет точек для показа, двигаем счетчик на 1, чтобы при задании цента карты началась загрузка
    const fetchStat = useRef({ enabled: true, updateCounter: pickupPoints.length ? 0 : 1 });

    useEffectOnce(() => {
        // Сделал через передачу селектора
        // чтобы убрать подписку с getPickupMapState на этом компоненте
        // Т.к. pickupMapState постоянно обновляется
        dispatch(setMapStateBySelector(getPickupMapState));
    });

    useEffect(() => {
        dispatch(setPickupMapState(mapCenter, mapZoom));

        if (mapZoom >= MIN_ZOOM) {
            setIsLargeZoom(false);
            fetchStat.current.enabled = true;
        } else {
            setIsLargeZoom(true);
            fetchStat.current.enabled = false;
        }
    }, [dispatch, mapCenter, mapZoom]);

    const loadPickupPoints = React.useCallback(
        (bounds: Sdk.GeoBounds) => {
            fetchStat.current.updateCounter += 1;

            if (fetchStat.current.enabled && fetchStat.current.updateCounter > SKIP_BOUND_UPDATES) {
                dispatch(fetchPickupPoints(bounds, getCenterByBounds(bounds)));
            }
        },
        [dispatch, fetchStat],
    );

    useThrottleFn(loadPickupPoints, FETCH_POINTS_WAIT, [mapBounds]);

    useEffect(() => {
        if (asyncData.isNotComplete(pickupPointsStatus) || isNullBounds(mapBounds)) {
            setIsEmptyPointList(false);
        } else {
            setIsEmptyPointList(
                !pickupPoints.some((point) => isInnerPoint(mapBounds, point.coordinates)),
            );
        }
    }, [mapBounds, pickupPoints, pickupPointsStatus]);

    useEffect(() => {
        const placemarks = pickupPoints.map((pickupPoint) => {
            return {
                id: pickupPoint.id,
                coordinates: pickupPoint.coordinates,
                variant: PlacemarkVariant.smallTail,
                onClick() {
                    dispatch(
                        selectPickupPoint(pickupPoint, () => {
                            history.push(Path.PickupSelected);
                        }),
                    );
                },
            };
        });

        dispatch(setMapPlacemarks(placemarks));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickupPoints]);

    return (
        <React.Fragment>
            {children}
            {isEmptyPointList || isLargeZoom ? (
                <NoPlacemarksPopup
                    visible
                    variant={isEmptyPointList ? 'no-placemarks' : 'large-zoom'}
                />
            ) : null}
        </React.Fragment>
    );
});
