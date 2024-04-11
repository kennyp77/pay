import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { resetMap, setMapState } from '../store/map';

export function useMapOnAddressesAddPage(visible: boolean = true) {
    const dispatch = useDispatch();

    useEffectOnce(() => {
        dispatch(setMapState({ visible }));

        return () => {
            dispatch(resetMap());
        };
    });
}
