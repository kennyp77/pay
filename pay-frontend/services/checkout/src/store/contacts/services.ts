import isEqual from '@tinkoff/utils/is/equal';
import { logError } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import * as transform from '../../api-transform/contacts';
import * as api from '../../api/pay-api';
import { isPassportOwner, isPayOwner } from '../../helpers/contacts';
import { logContacts } from '../../helpers/log';
import { AppErrorReason } from '../../typings';
import {
    resetErrorScreen,
    saveUserState,
    setErrorScreen,
    setErrorScreenWithClose,
    setErrorScreenWithRefresh,
} from '../app';

import {
    setContactList,
    setSelectedId,
    setAddContact,
    setEditContact,
    setDeleteContact,
} from './mutators';
import { getContactById, getSelectedContactId } from './selectors';

import { getContactList } from '.';

export const refreshContactList = createService<RootState>(async ({ dispatch, getState }) => {
    await dispatch(setContactList(asyncData.pending()));

    try {
        const res = await api.loadContacts();
        let contactsList = transform.contactsList(res);
        const passportContactIndex = contactsList.findIndex((item) => isPassportOwner(item));
        const hasPassportContact = passportContactIndex !== -1;

        logContacts('loadContacts-raw', res.data.results as any);

        if (hasPassportContact) {
            if (contactsList.length === 1) {
                try {
                    const res = await api.createContact(contactsList[0]);
                    contactsList = [transform.contactItem(res)];
                } catch (_error) {
                    logError(_error, { fn: 'createContact in refreshContactList' });
                }
            } else {
                contactsList.splice(passportContactIndex, 1);
            }
        }

        const contactId = getSelectedContactId(getState());
        logContacts('refreshContactList', contactsList, contactId);

        await dispatch(setContactList(asyncData.success(contactsList)));
    } catch (error) {
        logError(error, { fn: 'refreshContactList' });

        await dispatch(setContactList(asyncData.error('error_refresh')));

        await dispatch(
            setErrorScreenWithRefresh({
                reason: 'error_refresh_contact_list',
                description: 'Произошла ошибка при загрузке списка контактов',
                action: async () => await dispatch(setContactList(asyncData.initial())),
            }),
        );
    }
});

type SelectOptions = {
    initialSet?: boolean;
};

export const selectContact = createService<
    RootState,
    [Checkout.ContactId, Sys.CallbackFn0?, SelectOptions?]
>(async ({ dispatch, getState }, selectedId, next, options = {}) => {
    await dispatch(setSelectedId(selectedId));

    const contactsList = getContactList(getState());
    logContacts('selectContact', contactsList, selectedId);

    if (!options.initialSet) {
        await dispatch(saveUserState({ contactId: selectedId }));
    }

    if (next) {
        await next();
    }
});

export const createContact = createService<RootState, [Checkout.ContactFormData, Sys.CallbackFn0?]>(
    async ({ dispatch }, formData, next) => {
        await dispatch(setAddContact(asyncData.pending()));

        try {
            const res = await api.createContact(formData);
            const contact = transform.contactItem(res);

            await dispatch(refreshContactList());
            await dispatch(selectContact(contact.id));
            await dispatch(setAddContact(asyncData.success(undefined)));

            if (next) {
                await next();
            }
        } catch (error) {
            logError(error, { fn: 'createContact' });

            await dispatch(setAddContact(asyncData.error('error_add')));

            await dispatch(
                setErrorScreenWithClose({
                    reason: 'error_create_contact',
                    description: 'Произошла ошибка при создании контакта',
                    action: () => dispatch(setAddContact(asyncData.initial())),
                }),
            );
        }
    },
);

export const updateContact = createService<
    RootState,
    [Checkout.ContactId, Checkout.ContactFormData, Sys.CallbackFn0]
>(async ({ dispatch, getState }, contactId, formData, next) => {
    await dispatch(setEditContact(asyncData.pending()));

    try {
        const contact = getContactById(getState())(contactId);

        if (!isEqual(contact, formData)) {
            // TODO: Убрать погда починят АПИ
            const res = isPayOwner(contact)
                ? await api.updateContact(contactId, formData)
                : await api.createContact(formData);

            const newContact = transform.contactItem(res);

            await dispatch(refreshContactList());
            await dispatch(selectContact(newContact.id));
        } else {
            // @ts-ignore
            await dispatch(selectContact(contact.id));
        }

        await dispatch(setEditContact(asyncData.success(undefined)));

        await next();
    } catch (error) {
        logError(error, { fn: 'updateContact' });

        await dispatch(setEditContact(asyncData.error('error_add')));

        await dispatch(
            setErrorScreenWithClose({
                reason: 'error_update_contact',
                description: 'Произошла ошибка при обновлении контакта',
                action: async () => await dispatch(setEditContact(asyncData.initial())),
            }),
        );
    }
});

export const deleteContact = createService<RootState, [Checkout.ContactId, Sys.CallbackFn0]>(
    async ({ getState, dispatch }, contactId, next) => {
        await dispatch(setDeleteContact(asyncData.pending()));

        const contactList = getContactList(getState());

        if (contactList.length === 1) {
            await dispatch(
                setErrorScreen({
                    reason: AppErrorReason.RemoveLastContactError,
                    message: 'Невозможно удалить единственный контакт',
                    description: 'Сначала добавьте ещё один контакт',
                    action: () => dispatch(resetErrorScreen()),
                    actionText: 'Отмена',
                }),
            );

            await dispatch(setDeleteContact(asyncData.error('error_delete')));

            return;
        }

        try {
            await api.deleteContact(contactId);

            await dispatch(refreshContactList());
            await dispatch(setDeleteContact(asyncData.success(undefined)));

            await next();
        } catch (error) {
            logError(error, { fn: 'deleteContact' });

            await dispatch(setDeleteContact(asyncData.error('error_add')));

            await dispatch(
                setErrorScreenWithClose({
                    reason: 'error_delete_contact',
                    description: 'Произошла ошибка при удалении контакта',
                    action: async () => await dispatch(setDeleteContact(asyncData.initial())),
                }),
            );
        }
    },
);
