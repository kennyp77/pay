import React, { useCallback, useEffect } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { usePrevious } from 'react-use';

import { ConfirmModal } from '../../components/confirm-modal';
import { counters } from '../../counters';
import { history, Path } from '../../router';
import { deleteAddress, getDeleteAddressStatus } from '../../store/addresses';

interface AddressesDeleteProps {
    show: boolean;
    addressId: string;
    onCancel: Sys.CallbackFn0;
}

export function AddressesDelete({ show, addressId, onCancel: onCancelFn }: AddressesDeleteProps) {
    const deleteAddressFn = useService(deleteAddress);
    const prevShow = usePrevious(show);

    const deleteStatus = useSelector(getDeleteAddressStatus);

    const onRemove = useCallback(() => {
        counters.addressDeleteFormSubmit({ id: addressId });
        deleteAddressFn(addressId, () => history.push(Path.Addresses));
    }, [deleteAddressFn, addressId]);

    const onCancel = useCallback(() => {
        counters.addressDeleteFormAbort();
        onCancelFn();
    }, [onCancelFn]);

    useEffect(() => {
        if (asyncData.isError(deleteStatus)) {
            onCancel();
        }
    }, [deleteStatus, onCancel]);

    useEffect(() => {
        if (Boolean(show) === Boolean(prevShow)) {
            return;
        }

        if (show) {
            counters.addressDeleteFormShow();
        } else if (prevShow) {
            counters.addressDeleteFormClose();
        }
    }, [show, prevShow]);

    return (
        <ConfirmModal
            subject="Вы действительно хотите удалить адрес?"
            visible={show}
            onConfirm={onRemove}
            onCancel={onCancel}
            progress={asyncData.isPending(deleteStatus)}
        />
    );
}
