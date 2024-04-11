import memoize from '@tinkoff/utils/function/memoize/one';
import propOr from '@tinkoff/utils/object/propOr';
import { createSelector } from 'reselect';

import { RootState } from '..';
import { SERVICE_OWNER_MARKET } from '../../config';

const getState = (state: RootState) => state.addresses;

const TYPE_HOME_KEY = 'home';

export const getAddressList = createSelector(getState, (state) => state.list.result || []);

export const getIsEmptyAddressList = createSelector(
    getAddressList,
    (addressList) => addressList.length === 0,
);

export const getAddressListStatus = createSelector(getState, (state) => state.list.status);

export const getSelectedAddress = createSelector(getState, getAddressList, (state, list) =>
    list.find((item) => item.id === state.selectedId),
);

export const getSelectedAddressId = createSelector(getSelectedAddress, (address) =>
    address ? address.id : '',
);

export const getFirstAddressId = createSelector(getAddressList, (list) => {
    const marketAddress = list.find(
        (item) => item.id && item.ownerService === SERVICE_OWNER_MARKET,
    );
    const homeAddress = list.find((item) => item.id && item.type === TYPE_HOME_KEY);
    const anyAddress = list.find((item) => item.id);

    return propOr('id', '', marketAddress || homeAddress || anyAddress);
});

export const getAddAddressStatus = createSelector(getState, (state) => state.addAddress.status);

export const getEditAddressStatus = createSelector(getState, (state) => state.editAddress.status);

export const getDeleteAddressStatus = createSelector(
    getState,
    (state) => state.deleteAddress.status,
);

export const getAddressById = createSelector(getAddressList, (list) =>
    memoize((addressId: Checkout.AddressId) => list.find((item) => item.id === addressId)),
);

export const getAddressFormData = createSelector(
    getAddressById,
    (getById) => (addressId: Checkout.AddressId) => {
        const address = getById(addressId);

        if (!address) {
            return null;
        }

        return {
            address: [address.country, address.locality, address.street, address.building].join(
                ', ',
            ),
            ...address,
        };
    },
);
