import memoize from '@tinkoff/utils/function/memoize/one';
import omit from '@tinkoff/utils/object/omit';
import propOr from '@tinkoff/utils/object/propOr';
import { createSelector } from 'reselect';

import { RootState } from '..';

const getState = (state: RootState) => state.contacts;

export const getContactList = createSelector(getState, (state) => state.list.result || []);

export const getContactListStatus = createSelector(getState, (state) => state.list.status);

export const getSelectedContact = createSelector(getState, getContactList, (state, list) =>
    list.find((item) => item.id === state.selectedId),
);

export const getSelectedContactId = createSelector(getSelectedContact, (contact) =>
    contact ? contact.id : '',
);

export const getFirstContactId = createSelector(getContactList, (list) =>
    propOr(
        'id',
        '',
        list.find((item) => item.id),
    ),
);

export const getAddContactStatus = createSelector(getState, (state) => state.addContact.status);

export const getEditContactStatus = createSelector(getState, (state) => state.editContact.status);

export const getDeleteContactStatus = createSelector(
    getState,
    (state) => state.deleteContact.status,
);

export const getContactById = createSelector(getContactList, (list) =>
    memoize((contactId: Checkout.ContactId) => list.find((item) => item.id === contactId)),
);

export const getContactFormData = createSelector(
    getContactById,
    (getById) => (contactId: Checkout.ContactId) => {
        const contact = getById(contactId);

        return contact || null;
    },
);
