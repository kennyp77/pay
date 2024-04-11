import React, { useCallback, useEffect } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { ConfirmModal } from '../../components/confirm-modal';
import { history, Path } from '../../router';
import { deleteContact, getDeleteContactStatus } from '../../store/contacts';

interface ContactDeleteProps {
    show: boolean;
    contactId: string;
    onCancel: Sys.CallbackFn0;
}

export function ContactDelete({ show, contactId, onCancel }: ContactDeleteProps) {
    const deleteContactFn = useService(deleteContact);

    const deleteStatus = useSelector(getDeleteContactStatus);

    const onRemove = useCallback(() => {
        deleteContactFn(contactId, () => history.push(Path.Contacts));
    }, [deleteContactFn, contactId]);

    useEffect(() => {
        if (asyncData.isError(deleteStatus)) {
            onCancel();
        }
    }, [deleteStatus, onCancel]);

    return (
        <ConfirmModal
            subject="Вы действительно хотите удалить контакт?"
            visible={show}
            onConfirm={onRemove}
            onCancel={onCancel}
            progress={asyncData.isPending(deleteStatus)}
        />
    );
}
