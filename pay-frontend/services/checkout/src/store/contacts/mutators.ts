import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';

export const setContactList = createService<RootState, [Async.Data<Checkout.Contact[]>]>(
    ({ getState, setState }, data) => {
        setState(
            produce(getState(), (draft) => {
                draft.contacts.list = {
                    ...draft.contacts.list,
                    ...data,
                };
            }),
        );
    },
);

export const setSelectedId = createService<RootState, [Checkout.ContactId]>(
    ({ getState, setState }, selectedId) => {
        setState(
            produce(getState(), (draft) => {
                draft.contacts.selectedId = selectedId;
            }),
        );
    },
);

export const setAddContact = createService<RootState, [Async.Data<void>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.contacts.addContact = asyncData;
            }),
        );
    },
);

export const setEditContact = createService<RootState, [Async.Data<void>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.contacts.editContact = asyncData;
            }),
        );
    },
);

export const setDeleteContact = createService<RootState, [Async.Data<void>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.contacts.deleteContact = asyncData;
            }),
        );
    },
);
