import { AsyncStatus } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';

type AsyncDataPP = { bounds?: Checkout.MapBounds; list: Sdk.PickupPoint[] };

export const setPickupPointsList = createService<RootState, [Sdk.PickupPoint[]]>(
    function setPickupPointsList({ getState, setState }, data) {
        setState(
            produce(getState(), (draft) => {
                const { points } = draft.shipping.pickup;

                draft.shipping.pickup.points.result = {
                    ...(points.result || {}),
                    list: data,
                };
            }),
        );
    },
);

export const patchPickupPoints = createService<RootState, [Async.Data<Partial<AsyncDataPP>>]>(
    function patchPickupPoints({ getState, setState }, data) {
        setState(
            produce(getState(), (draft) => {
                const { points } = draft.shipping.pickup;

                draft.shipping.pickup.points = {
                    status: data.status,
                    result: {
                        bounds: data.result?.bounds || points.result?.bounds,
                        list: data.result?.list || points.result?.list || [],
                    },
                };
            }),
        );
    },
);

export const setPickupPoints = createService<RootState, [Async.Data<AsyncDataPP>]>(
    function setPickupPoints({ getState, setState }, data) {
        setState(
            produce(getState(), (draft) => {
                draft.shipping.pickup.points = data;
            }),
        );
    },
);

export const updateSelectedPoint = createService<RootState, [Sdk.PickupPoint]>(
    function setPickupPoints({ getState, setState }, data) {
        setState(
            produce(getState(), (draft) => {
                if (draft.shipping.pickup.selectedId === data.id) {
                    const { pickup } = draft.shipping;
                    pickup.selectedPoint = data;

                    const list = pickup.points.result?.list;
                    const index = list?.findIndex((p) => p.id === data.id);

                    if (index !== undefined && index >= 0 && pickup.points.result) {
                        pickup.points.result.list[index] = data;
                    }
                }
            }),
        );
    },
);

export const setSelectedPickupPoint = createService<RootState, [Sdk.PickupPoint]>(
    function setSelectedPickupPoint({ getState, setState }, pickupPoint) {
        setState(
            produce(getState(), (draft) => {
                if (draft.shipping.pickup.selectedId !== pickupPoint.id) {
                    draft.shipping.pickup.selectedId = pickupPoint.id;
                    draft.shipping.pickup.selectedPoint = pickupPoint;
                }
            }),
        );
    },
);

export const setSendPickupPoint = createService<RootState, [Async.Data<void>]>(
    function setSendPickupPoint({ getState, setState }, asyncData) {
        setState(
            produce(getState(), (draft) => {
                draft.shipping.pickup.sendPickupPoint = asyncData;
            }),
        );
    },
);

export const setPickupMapState = createService<RootState, [Checkout.MapPoint, Checkout.MapZoom]>(
    function setPickupMapState({ getState, setState }, center, zoom) {
        setState(
            produce(getState(), (draft) => {
                draft.shipping.pickup.mapState = { center, zoom };
            }),
        );
    },
);
