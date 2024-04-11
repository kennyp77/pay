import { logError, logInfo } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';
import { MessageType } from '@yandex-pay/sdk/src/typings';

import { pickupPointsList } from '../../api-transform/pickup';
import { counters } from '../../counters';
import {
    // isBoundsLoaded,
    getBoundsByInitialPoints,
    getCenterByInitialPoints,
    // getBoundsForFetch,
    getMinZoomForFetch,
    parsePickupPoints,
} from '../../helpers/pickup';
import { CheckoutApi } from '../../lib/checkout-api';
import { FormConnection } from '../../lib/intercom';
import { history, Path } from '../../router';
import { ShippingType } from '../../typings';
import { setErrorWithPingOpener, setObStepOnboarded } from '../app';
import { updatePaymentInfo } from '../mix';
import { setSheetOrder } from '../payment';
import { selectShippingType } from '../shipping';
import { RootState } from '../state';

import {
    setPickupPoints,
    patchPickupPoints,
    setSendPickupPoint,
    setPickupMapState,
} from './mutators';

import {
    // getPickupPointsBounds,
    getPickupPointsList,
    getPickupSelectedPoint,
    setSelectedPickupPoint,
    setPickupPointsList,
    updateSelectedPoint,
    isPickupPointHasInfo,
} from '.';

export const setNewPickupPoints = createService<RootState, [Sdk.PickupPoint[]?]>(
    async ({ dispatch, getState }, newPickupPoints) => {
        if (newPickupPoints) {
            const loadedPoints = getPickupPointsList(getState());
            const pickupPoints = pickupPointsList(newPickupPoints);
            const points = parsePickupPoints(loadedPoints, pickupPoints);

            dispatch(setPickupPointsList(points));
        }
    },
);

export const watchPickupPoints = createService<RootState>(async ({ dispatch, getState }) => {
    const connection = FormConnection.getInstance();

    connection.on(MessageType.Update, (event) => {
        if (event?.updateData && event.updateData.pickupPoints) {
            dispatch(setNewPickupPoints(event.updateData.pickupPoints));
        }
    });
});

export const setInitialPickupPoints = createService<RootState, [Sdk.PickupPoint[]]>(
    function setInitialPickupPoints({ dispatch }, rawPickupPoints) {
        const pickupPoints = pickupPointsList(rawPickupPoints);
        const points = parsePickupPoints([], pickupPoints);
        const center = getCenterByInitialPoints(points);
        const bounds = getBoundsByInitialPoints(points);

        if (center && bounds) {
            dispatch(setPickupMapState(center, getMinZoomForFetch()));
            dispatch(setPickupPoints(asyncData.success({ list: points, bounds })));
        }
    },
);

/**
 * В этом сервисе мы только меняем статус запроса точек
 * Сами точки меняются в вотчере watchPickupPoints
 * Так будет до тех пор пока не поменяем модель запросов на req/res всместо событий
 */
let fetchPickupPointsCounter = 0;
export const fetchPickupPoints = createService<RootState, [Sdk.GeoBounds, Sdk.GeoPoint]>(
    async function fetchPickupPoints({ getState, dispatch }, bounds, center) {
        // const loadedBounds = getPickupPointsBounds(state);
        // const fetchBounds = getBoundsForFetch(bounds);

        // NB: Временное решение
        // if (loadedBounds && isBoundsLoaded(bounds, loadedBounds)) {
        //     return;
        // }

        await dispatch(patchPickupPoints(asyncData.pending({ result: { bounds } })));

        try {
            fetchPickupPointsCounter += 1;
            const { pickupPoints } = await CheckoutApi.getInstance().pickupBoundsChange(
                bounds,
                center,
            );

            await dispatch(setNewPickupPoints(pickupPoints));

            fetchPickupPointsCounter -= 1;

            if (fetchPickupPointsCounter === 0) {
                await dispatch(patchPickupPoints(asyncData.success({})));
            }
        } catch (error) {
            fetchPickupPointsCounter -= 1;
            logError(error, { fn: 'fetchPickupPoints' });

            if (fetchPickupPointsCounter === 0) {
                await dispatch(
                    patchPickupPoints(asyncData.error('Error while fetching pickup points')),
                );
            }
        }
    },
);

export const requestPickupInfo = createService<RootState, [Sdk.PickupPoint]>(
    async function requestPickupInfo({ dispatch, getState }, pickupPoint) {
        const state = getState();
        const pickupPointHasInfo = isPickupPointHasInfo(state);

        if (!pickupPointHasInfo) {
            try {
                const res = await CheckoutApi.getInstance().pickupInfoRequest({
                    pickupPointId: pickupPoint.id,
                });

                if (res.pickupPoint) {
                    dispatch(updateSelectedPoint(res.pickupPoint));
                }
            } catch (error) {
                logError(error, { fn: 'requestPickupInfo' });
                dispatch(
                    setErrorWithPingOpener({
                        reason: 'error_request_pickup_info',
                        description:
                            'Не удалось загрузить информацию для выбранной точки самовывоза',

                        action: () => {
                            logInfo('error_request_pickup_info');
                            history.push(Path.PickupSelected);
                        },
                        actionText: 'Повторить',
                    }),
                );
            }
        }
    },
);

export const selectPickupPoint = createService<RootState, [Sdk.PickupPoint, Sys.CallbackFn0?]>(
    async function selectPickupPoint({ dispatch }, pickupPoint, next) {
        await dispatch(setSelectedPickupPoint(pickupPoint));

        if (next) {
            next();
        }
    },
);

export const sendPickupPoint = createService<RootState, [Sys.CallbackFn0]>(
    async function sendPickupPoint({ dispatch, getState }, next) {
        const state = getState();
        const pickupPoint = getPickupSelectedPoint(state);

        if (pickupPoint) {
            try {
                await dispatch(setSendPickupPoint(asyncData.pending()));

                const updateData = await CheckoutApi.getInstance().pickupPointChange(pickupPoint);

                await dispatch(selectShippingType(ShippingType.Pickup));
                await dispatch(setSheetOrder(updateData.order));
                await dispatch(updatePaymentInfo());

                counters.pickupOptionSelect();

                await dispatch(setObStepOnboarded('pickup'));
                await dispatch(setSendPickupPoint(asyncData.success(undefined)));
            } catch (error) {
                logError(error, { fn: 'sendPickupPoint' });

                dispatch(
                    setErrorWithPingOpener(
                        {
                            reason: 'error_send_pickup_point',
                            description: 'Произошла ошибка при выборе точки самовывоза',
                            action: () => {
                                logInfo('sendPickupPoint click again');
                                history.push(Path.PickupSelected);
                            },
                            actionText: 'Повторить',
                        },
                        () => {
                            dispatch(setSendPickupPoint(asyncData.error('error_send')));
                        },
                    ),
                );
            }
        }

        if (next) {
            next();
        }
    },
);
