import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { MapLayoutVariant } from '../components/layout/types';
import { MAP_LAYOUT_VARIANT_MARGINS, resetMap, setMapState } from '../store/map';

export function useMapOnPickupPage(layout: MapLayoutVariant = MapLayoutVariant.Desktop) {
    const dispatch = useDispatch();

    useEffectOnce(() => {
        dispatch(
            setMapState({
                visible: true,
                margin: MAP_LAYOUT_VARIANT_MARGINS[layout],
            }),
        );

        return () => {
            dispatch(resetMap());
        };
    });
}
