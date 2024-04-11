import { createService } from '@yandex-pay/react-services';

import { toPointsWithUniqueCoordinates } from '../../helpers/pickup';
import { RootState } from '../state';

import { MapState } from './state';

export const setMapSdk = createService<RootState, [Async.Data<void>]>(function setMapSdk(
    { produce },
    sdk,
) {
    produce((draft) => {
        draft.map.sdk = sdk;
    });
});

export const setMapPlacemarks = createService<RootState, [Checkout.MapPlacemark[]]>(
    function setMapPlacemarks({ getState, dispatch, produce }, placemarks) {
        produce((draft) => {
            draft.map.placemarks = toPointsWithUniqueCoordinates(placemarks);
        });
    },
);

export const setMapState = createService<RootState, [Partial<MapState>]>(function setMapState(
    { produce },
    nextState,
) {
    produce((draft) => {
        draft.map = {
            ...draft.map,
            ...nextState,
        };
    });
});
