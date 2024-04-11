import { useDispatch, useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { getAddressFormData } from '../store/addresses';
import { PlacemarkVariant, resetMap, setMapState, showSinglePlacemark } from '../store/map';

export function useMapOnAddressesEditPage(addressId: string, visible: boolean = true) {
    const dispatch = useDispatch();

    const address = useSelector(getAddressFormData)(addressId);

    useEffectOnce(() => {
        const nextState = { visible };

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
