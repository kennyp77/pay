import omit from '@tinkoff/utils/object/omit';
import pick from '@tinkoff/utils/object/pick';
import { logError } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';
import { ShippingType } from '@yandex-pay/sdk/src/typings';

import { RootState } from '..';
import * as transform from '../../api-transform/addresses';
import * as api from '../../api/pay-api';
import { counters } from '../../counters';
import { isEqual, isPayOwner, sortAddressList } from '../../helpers/adresses';
import { prepareAddressesListForCount } from '../../helpers/counter';
import { saveUserState, setErrorScreenWithClose, setErrorScreenWithRefresh } from '../app';
import { refreshShippingOptionsList, selectShippingType } from '../shipping';

import {
    setAddressList,
    setSelectedId,
    setAddAddress,
    resetAddAddress,
    setEditAddress,
    resetEditAddress,
    setDeleteAddress,
} from './mutators';
import { getAddressById } from './selectors';

import { getAddressList } from '.';

export const refreshAddressList = createService<RootState, [string?]>(
    async ({ dispatch }, selectedId) => {
        await dispatch(setAddressList(asyncData.pending()));

        try {
            const res = await api.loadAddresses();
            const addressesList = transform.addressesList(res);
            const sortedAddressesList = sortAddressList(addressesList, selectedId);

            counters.addressList(prepareAddressesListForCount(sortedAddressesList));

            await dispatch(setAddressList(asyncData.success(sortedAddressesList)));
        } catch (error) {
            logError(error, { fn: 'refreshAddressList' });

            await dispatch(setAddressList(asyncData.error('error_refresh')));

            await dispatch(
                setErrorScreenWithRefresh({
                    reason: 'error_refresh_address_list',
                    description: 'Произошла ошибка при загрузке списка адресов',
                    action: () => dispatch(setAddressList(asyncData.initial())),
                }),
            );
        }
    },
);

type SelectOptions = {
    initialSet?: boolean;
};

export const selectAddress = createService<
    RootState,
    [Checkout.AddressId, Sys.CallbackFn1<Checkout.Address | undefined>?, SelectOptions?]
>(async ({ dispatch, getState }, selectedId, next, options = {}) => {
    await dispatch(setSelectedId(selectedId));
    await dispatch(selectShippingType(ShippingType.Direct));

    const address = getAddressById(getState())(selectedId);

    // Запрашиваем варианты доставки при выборе адреса
    dispatch(refreshShippingOptionsList());

    if (!options.initialSet) {
        await dispatch(saveUserState({ addressId: selectedId }));
    }

    if (next) {
        await next(address);
    }
});

export const createAddress = createService<RootState, [Checkout.AddressFormData, Sys.CallbackFn0]>(
    async ({ dispatch, getState }, formData, next) => {
        await dispatch(setAddAddress(asyncData.pending()));
        try {
            const info = await api.loadAddressGeocode(formData.address);
            const newAddress = omit(['address'], {
                ...formData,
                ...pick(['country', 'locality', 'street', 'building'], info.data),
            });

            const addressesList = getAddressList(getState());
            const existingSameAddress = addressesList.find((item) => isEqual(item, newAddress));

            if (existingSameAddress) {
                await dispatch(selectAddress(existingSameAddress.id));
            } else {
                const res = await api.createAddress(newAddress);
                const address = transform.addressItem(res);

                await dispatch(refreshAddressList());
                await dispatch(selectAddress(address.id));
            }

            await dispatch(resetAddAddress());
            await dispatch(setAddAddress(asyncData.success(undefined)));

            await next();
        } catch (error) {
            logError(error, { fn: 'createAddress' });

            await dispatch(setAddAddress(asyncData.error('error_add')));

            await dispatch(
                setErrorScreenWithClose({
                    reason: 'error_create_address',
                    description: 'Произошла ошибка при сохранении карты',
                    action: () => dispatch(setAddAddress(asyncData.initial())),
                }),
            );
        }
    },
);

export const updateAddress = createService<
    RootState,
    [Checkout.AddressId, Checkout.AddressFormData, Sys.CallbackFn0]
>(async ({ dispatch, getState }, addressId, formData, next) => {
    await dispatch(setEditAddress(asyncData.pending()));

    try {
        const info = await api.loadAddressGeocode(formData.address);
        const nextAddressData = omit(['address'], {
            ...formData,
            ...pick(['country', 'locality', 'street', 'building'], info.data),
        });

        const address = getAddressById(getState())(addressId);

        const addressesList = getAddressList(getState());
        const existingSameAddress = addressesList.find((item) => isEqual(item, nextAddressData));

        // не пересохраняем, если ничего не поменялось
        if (isEqual(address, nextAddressData)) {
            await dispatch(resetEditAddress());
            // @ts-ignore
            await dispatch(selectAddress(address.id));
        } else if (existingSameAddress) {
            // если уже такой адрес есть,
            // удалить текущий и поставить активным существующий
            await dispatch(deleteAddress(addressId));
            await dispatch(selectAddress(existingSameAddress.id));
        } else {
            // и только если адрес новый, обновляем

            // TODO: Убрать погда починят АПИ
            const res = isPayOwner(address)
                ? await api.updateAddress(addressId, nextAddressData)
                : await api.createAddress(nextAddressData);

            const newAddress = transform.addressItem(res);

            await dispatch(refreshAddressList());
            await dispatch(selectAddress(newAddress.id));
        }

        await dispatch(resetEditAddress());
        await dispatch(setEditAddress(asyncData.success(undefined)));

        await next();
    } catch (error) {
        logError(error, { fn: 'updateAddress' });

        await dispatch(setEditAddress(asyncData.error('error_add')));

        await dispatch(
            setErrorScreenWithClose({
                reason: 'error_update_address',
                description: 'Произошла ошибка при обновлении адреса',
                action: async () => await dispatch(setEditAddress(asyncData.initial())),
            }),
        );
    }
});

export const deleteAddress = createService<RootState, [Checkout.AddressId, Sys.CallbackFn0?]>(
    async ({ dispatch }, addressId, next) => {
        await dispatch(setDeleteAddress(asyncData.pending()));

        try {
            await api.deleteAddress(addressId);

            await dispatch(refreshAddressList());
            await dispatch(setDeleteAddress(asyncData.success(undefined)));

            if (next) {
                await next();
            }
        } catch (error) {
            logError(error, { fn: 'deleteAddress' });

            await dispatch(setDeleteAddress(asyncData.error('error_add')));

            await dispatch(
                setErrorScreenWithClose({
                    reason: 'error_delete_address',
                    description: 'Произошла ошибка при удалении адреса',
                    action: async () => await dispatch(setDeleteAddress(asyncData.initial())),
                }),
            );
        }
    },
);
