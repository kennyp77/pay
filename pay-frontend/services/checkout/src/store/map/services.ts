import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';

import { loadAddressGeocode } from '../../api/pay-api';
import { MAP_API_KEY } from '../../config';
import { RootState } from '../state';

import {
    MAP_ADDRESS_ZOOM,
    MAP_SUGGEST_CITY_ZOOM,
    MAP_SUGGEST_ADDRESS_ZOOM,
    MAP_SUGGEST_STREET_ZOOM,
    MAP_SUGGEST_ZOOM,
} from './config';
import { setMapState, setMapSdk } from './mutators';
import { mapInitialState, MapState } from './state';

export const loadMapSdk = memoizeOnce(
    createService<RootState>(function loadMapSdk({ dispatch }) {
        dispatch(setMapSdk(asyncData.pending()));

        const mode = __DEV__ ? 'debug' : '';
        const modules = [
            'Map',
            'Placemark',
            'Clusterer',
            'geocode',
            'templateLayoutFactory',
            'control.GeolocationControl',
        ];
        const load = modules.join(',');

        const script = document.createElement('script');
        script.id = 'ymaps';
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${MAP_API_KEY}&lang=ru_RU&load=${load}&mode=${mode}`;

        script.addEventListener('load', () => {
            return window.ymaps.ready(
                function success() {
                    dispatch(setMapSdk(asyncData.success(undefined)));
                },
                function error() {
                    dispatch(setMapSdk(asyncData.error('Can not initialize map sdk')));
                },
            );
        });

        script.addEventListener('error', () => {
            dispatch(setMapSdk(asyncData.error('Can not load map sdk')));
        });

        document.head.appendChild(script);
    }),
);

export const showMapBySuggest = createService<RootState, [Checkout.SearchAddressSuggest]>(
    async function showMapBySuggest({ produce, dispatch }, addressStr) {
        const result = await loadAddressGeocode(addressStr);
        const { latitude, longitude } = result.data;

        let zoom = MAP_SUGGEST_ZOOM;

        if (result.data.locality) {
            zoom = MAP_SUGGEST_CITY_ZOOM;
        }

        if (result.data.street) {
            zoom = MAP_SUGGEST_STREET_ZOOM;
        }

        if (result.data.building) {
            zoom = MAP_SUGGEST_ADDRESS_ZOOM;
        }

        dispatch(
            setMapState({
                center: { latitude, longitude },
                zoom,
            }),
        );
    },
);

export const resetMap = createService<RootState>(function resetMap({ produce }) {
    produce((draft) => {
        draft.map.visible = mapInitialState.visible;
        draft.map.inactive = mapInitialState.inactive;
        draft.map.placemarks = mapInitialState.placemarks;
        draft.map.behaviors = mapInitialState.behaviors;
    });
});

export const setMapStateBySelector = createService<
    RootState,
    [Sys.CallbackFn1<RootState, Partial<MapState>>]
>(function setMapStateBySelector({ produce, dispatch, getState }, selectorFn) {
    dispatch(setMapState(selectorFn(getState())));
});

// TODO: Завести отдельные сервисы для показа адреса и точки самовывоза
//       На вход принимать адреса и распаковывать их уже тут
export const showSinglePlacemark = createService<
    RootState,
    [Checkout.MapPlacemark, Partial<MapState>?]
>(function showSinglePlacemark({ produce, getState }, placemark, nextState = {}) {
    produce((draft) => {
        draft.map = {
            ...draft.map,
            ...nextState,
        };

        draft.map.center = placemark.coordinates;
        draft.map.zoom = MAP_ADDRESS_ZOOM;
        draft.map.placemarks = [placemark];
    });
});
