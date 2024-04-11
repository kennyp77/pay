import { useDispatch, useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { MapLayoutVariant } from '../components/layout/types';
import {
    showSinglePlacemark,
    MAP_LAYOUT_VARIANT_MARGINS,
    PlacemarkVariant,
    resetMap,
    setMapState,
} from '../store/map';
import { getPickupSelectedPoint } from '../store/pickup';

export function useMapOnPickupSelectedPage(layout: MapLayoutVariant) {
    const dispatch = useDispatch();
    const selectedPickupPoint = useSelector(getPickupSelectedPoint);

    useEffectOnce(() => {
        const nextState = {
            visible: true,
            margin: MAP_LAYOUT_VARIANT_MARGINS[layout],
        };

        if (selectedPickupPoint) {
            dispatch(
                showSinglePlacemark(
                    {
                        id: selectedPickupPoint.id,
                        coordinates: selectedPickupPoint.coordinates,
                        variant:
                            layout === MapLayoutVariant.Desktop
                                ? PlacemarkVariant.pin
                                : PlacemarkVariant.smallTailRed,
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
