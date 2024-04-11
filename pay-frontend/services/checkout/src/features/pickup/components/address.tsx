import * as React from 'react';

import { useDispatch } from 'react-redux';

import { AddressSelector, AddressSelectorProps } from '../../../components/address-selector';
import { showMapBySuggest } from '../../../store/map';

interface PickupAddressProps {
    size?: AddressSelectorProps['size'];
    disabled?: AddressSelectorProps['disabled'];
    onSelect?: AddressSelectorProps['onSelect'];
}

export const PickupAddress: React.FC<PickupAddressProps> = function PickupAddress({
    size = 'm',
    disabled,
    onSelect,
}) {
    const dispatch = useDispatch();

    const onChange = React.useCallback(
        async (value: string) => {
            await dispatch(showMapBySuggest(value));

            if (onSelect) {
                onSelect(value);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <AddressSelector
            size={size}
            view="material"
            variant="filled"
            label="Поиск по улице, метро, названию"
            onSelect={onChange}
            searchType="any"
            disabled={disabled}
        />
    );
};
