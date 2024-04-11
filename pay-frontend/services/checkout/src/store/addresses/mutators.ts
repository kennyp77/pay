import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';

export const setAddressList = createService<RootState, [Async.Data<Checkout.Address[]>]>(
    ({ getState, setState }, data) =>
        setState(
            produce(getState(), (draft) => {
                draft.addresses.list = {
                    ...draft.addresses.list,
                    ...data,
                };
            }),
        ),
);

export const setSelectedId = createService<RootState, [Checkout.AddressId]>(
    ({ getState, setState }, selectedId) => {
        setState(
            produce(getState(), (draft) => {
                draft.addresses.selectedId = selectedId;
            }),
        );
    },
);

export const setAddAddress = createService<RootState, [Async.Data<void>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.addresses.addAddress = asyncData;
            }),
        );
    },
);

export const resetAddAddress = createService<RootState>(({ getState, setState }) => {
    setState(
        produce(getState(), (draft) => {
            draft.addresses.addAddress = asyncData.initial();
            draft.addresses.searchQuery = '';
            draft.addresses.searchSuggest = asyncData.initial();
        }),
    );
});

export const setEditAddress = createService<RootState, [Async.Data<void>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.addresses.editAddress = asyncData;
            }),
        );
    },
);

export const resetEditAddress = createService<RootState>(({ getState, setState }) => {
    setState(
        produce(getState(), (draft) => {
            draft.addresses.editAddress = asyncData.initial();
            draft.addresses.searchQuery = '';
            draft.addresses.searchSuggest = asyncData.initial();
        }),
    );
});

export const setDeleteAddress = createService<RootState, [Async.Data<void>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.addresses.deleteAddress = asyncData;
            }),
        );
    },
);
