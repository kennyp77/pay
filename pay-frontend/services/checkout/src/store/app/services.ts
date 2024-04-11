import { logError } from '@trust/rum';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import * as transform from '../../api-transform/user-settings';
import * as api from '../../api/pay-api';
import { pingOpener } from '../../helpers/ping';
import { getEmptyUserState } from '../../helpers/user-state';
import { AppError } from '../../typings';
import { getSelectedAddressId } from '../addresses';
import { getSelectedContactId } from '../contacts';

import { setUserState } from './mutators';

import { setErrorScreen, setErrorScreenWithClose, setObStepOnboarded } from '.';

type UserSettings = Partial<Checkout.UserState>;

export const loadUserState = createService<RootState>(async ({ dispatch }) => {
    try {
        const res = await api.loadUserSettings();
        const userState = transform.userState(res);

        await dispatch(setUserState(userState));
    } catch (error) {
        await dispatch(setUserState(getEmptyUserState()));
        logError(error, { fn: 'loadUserState' });
    }
});

export const saveUserState = createService<RootState, [UserSettings]>(
    async ({ dispatch, getState }, userSettings) => {
        const state = getState();

        const addressId = getSelectedAddressId(state);
        const contactId = getSelectedContactId(state);

        try {
            const res = await api.updateUserSettings(userSettings);
            const userState = transform.userState(res);

            if (userSettings.addressId) {
                await dispatch(setObStepOnboarded('address'));
            }

            if (userSettings.contactId) {
                await dispatch(setObStepOnboarded('contact'));
            }
        } catch (error) {
            logError(error, { fn: 'saveUserState' });
        }
    },
);

export const setErrorWithPingOpener = createService<RootState, [AppError, Sys.CallbackFn0?]>(
    async function setErrorWithPingOpener(
        { dispatch },
        { reason, description, action, actionText },
        finallyFn,
    ) {
        try {
            await pingOpener();

            dispatch(setErrorScreenWithClose({ reason, description, action, actionText }));
        } catch (err) {
            dispatch(
                // Показываем окно без возможности что-то сделать, т.к. нет связи с сдк
                setErrorScreen({ reason, description }),
            );
        } finally {
            if (finallyFn) {
                finallyFn();
            }
        }
    },
);
