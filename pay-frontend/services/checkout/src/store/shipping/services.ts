import { logError, logInfo } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import { getOptionIdToSelect } from '../../helpers/shippings';
import { CheckoutApi } from '../../lib/checkout-api';
import { history, Path } from '../../router';
import { ShippingType } from '../../typings';
import { getSelectedAddress } from '../addresses';
import { setErrorWithPingOpener } from '../app';
import { updatePaymentInfo } from '../mix';
import { setSheetOrder } from '../payment';

import {
    setShippingOptionsList,
    setSelectedId,
    setSelectShippingOptions,
    setDisableShippingOptions,
} from './mutators';
import { findShippingOption, getSelectedShippingOptionId } from './selectors';

import { setSelectedShippingType } from '.';

export const refreshShippingOptionsList = createService<RootState>(
    async ({ dispatch, getState }) => {
        const address = getSelectedAddress(getState());

        if (!address) {
            return;
        }

        await dispatch(setShippingOptionsList(asyncData.pending()));

        try {
            const { shippingOptions } = await CheckoutApi.getInstance().shippingAddressChange(
                address,
            );

            await dispatch(setShippingOptionsList(asyncData.success(shippingOptions)));
            await dispatch(setDisableShippingOptions(shippingOptions.length === 0));

            const optionId = getSelectedShippingOptionId(getState());
            const nextOptionId = getOptionIdToSelect(optionId, shippingOptions);

            if (!nextOptionId) {
                dispatch(resetShippingOption());
            } else {
                dispatch(selectShippingOption(nextOptionId));
            }
        } catch (error) {
            logError(error, { fn: 'refreshShippingOptionsList' });

            dispatch(
                setErrorWithPingOpener(
                    {
                        reason: 'error_refresh_shipping_options_list',
                        description: 'Произошла ошибка при загрузке способов доставки',
                        action: async () => {
                            logInfo('refreshShippingOptionsList click again');
                            await dispatch(setShippingOptionsList(asyncData.initial()));
                            dispatch(refreshShippingOptionsList());
                        },
                        actionText: 'Повторить',
                    },
                    () => {
                        dispatch(setShippingOptionsList(asyncData.error('error_refresh')));
                    },
                ),
            );
        }
    },
);

export const selectShippingOption = createService<
    RootState,
    [Sdk.ShippingOptionId, Sys.CallbackFn0?]
>(async ({ dispatch, getState }, selectedId, next) => {
    const shippingOption = findShippingOption(getState())(selectedId);

    if (shippingOption) {
        try {
            await dispatch(setSelectShippingOptions(asyncData.pending()));

            const updateData = await CheckoutApi.getInstance().shippingOptionChange(shippingOption);

            await dispatch(setSelectedId(selectedId));
            await dispatch(setSheetOrder(updateData.order));
            await dispatch(updatePaymentInfo());

            await dispatch(setSelectShippingOptions(asyncData.success(undefined)));
        } catch (error) {
            logError(error, { fn: 'selectShippingOption' });

            dispatch(
                setErrorWithPingOpener(
                    {
                        reason: 'error_select_shipping_option',
                        description: 'Произошла ошибка при выборе варианта доставки',
                        action: () => {
                            logInfo('selectShippingOption click again');
                            history.push(Path.DirectShipping);
                            dispatch(setSelectShippingOptions(asyncData.initial()));
                        },
                        actionText: 'Повторить',
                    },
                    () => {
                        dispatch(setSelectShippingOptions(asyncData.error('error_select')));
                    },
                ),
            );
        }
    }

    if (next) {
        await next();
    }
});

export const resetShippingOption = createService<RootState, [Sys.CallbackFn0?]>(
    async ({ dispatch }, next) => {
        try {
            await dispatch(setSelectShippingOptions(asyncData.pending()));

            const updateData = await CheckoutApi.getInstance().shippingOptionReset();

            await dispatch(setSelectedId(''));
            await dispatch(setSheetOrder(updateData.order));
            await dispatch(updatePaymentInfo());

            await dispatch(setSelectShippingOptions(asyncData.success(undefined)));
        } catch (error) {
            logError(error, { fn: 'resetShippingOption' });

            await dispatch(setSelectShippingOptions(asyncData.error('error_reset')));
        }

        if (next) {
            await next();
        }
    },
);

export const selectShippingType = createService<RootState, [ShippingType, Sys.CallbackFn0?]>(
    async ({ dispatch }, type, next) => {
        await dispatch(setSelectedShippingType(type));

        if (next) {
            next();
        }
    },
);
