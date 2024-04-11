import { useDispatch, useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { USER_LOCATION_COORDS } from '../config';
import { getSelectedAddress } from '../store/addresses';
import {
    MAP_ADDRESS_ZOOM,
    PlacemarkVariant,
    resetMap,
    setMapState,
    showSinglePlacemark,
} from '../store/map';

export function useMapOnContactsPage(visible: boolean = false) {
    const dispatch = useDispatch();
    const address = useSelector(getSelectedAddress);

    useEffectOnce(() => {
        const nextState = {
            visible,
            inactive: true,
            zoom: MAP_ADDRESS_ZOOM,
            center: USER_LOCATION_COORDS,
            behaviors: [],
        };

        if (address) {
            dispatch(
                showSinglePlacemark(
                    {
                        id: address.id,
                        coordinates: address.location,
                        variant: PlacemarkVariant.pin,
                    },
                    nextState,
                ),
            );
        } else {
            dispatch(setMapState(nextState));
        }

        return () => {
            dispatch(resetMap());
        };
    });
}
