import path from '@tinkoff/utils/object/path';
import { logError } from '@trust/rum';
import { getRequiredBillingFields } from '@trust/utils/payment-sheet';
import { ServerApiModule } from '@yandex-pay/pay-common';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import * as api from '../../api/pay-api';
import { USER_EMAIL, CHALLENGE_CARD_ID, CHALLENGE_NUM, IS_CHECKOUT_SERVER } from '../../config';
import { counters } from '../../counters';
import { errorDetails, errorReason } from '../../helpers/api-error';
import { getObSteps } from '../../helpers/onboarding';
import { pingOpener } from '../../helpers/ping';
import { isSplitAvailable } from '../../helpers/split';
import { CheckoutApi } from '../../lib/checkout-api';
import { CheckoutClientApi, FormConnection } from '../../lib/intercom';
import { history } from '../../router';
import { AppPendingReason } from '../../typings';
import { getAddressList, selectAddress, getFirstAddressId, refreshAddressList } from '../addresses';
import { startPaymentService } from '../checkout';
import { getContactList, selectContact, getFirstContactId, refreshContactList } from '../contacts';
import { setSheet, setEmail, getSheet } from '../payment';
import {
    getInitialPaymentMethodId,
    refreshPaymentMethods,
    selectPaymentMethod,
} from '../payment-methods';
import { setInitialPickupPoints } from '../pickup';
import { loadSplitPlan, setSplitAvailable } from '../split';

import {
    setPendingScreen,
    resetPendingScreen,
    setObSteps,
    setErrorScreenWithBack,
} from './mutators';
import { getUserState } from './selectors';
import { loadUserState, saveUserState } from './services';
import { hasId } from './utils';

import { resetInitialLoader } from '.';

const PAYMENT_TIMEOUT = 10000;

const waitForSheet = createService<RootState>(async ({ dispatch }) => {
    const connection = FormConnection.getInstance();

    dispatch(setPendingScreen({ reason: AppPendingReason.SheetLoading }));

    try {
        let sheet = await CheckoutClientApi.getInstance().waitSheet(PAYMENT_TIMEOUT);

        if (IS_CHECKOUT_SERVER) {
            sheet = await ServerApiModule.getInstance().waitSheet(0, sheet);
        }

        if (!IS_CHECKOUT_SERVER) {
            await api.validate(connection.options.targetOrigin, sheet);
        }

        await Promise.all([dispatch(setSheet(sheet))]);
    } catch (error) {
        logError(error, { fn: 'waitForSheetAction' });

        throw error;
    }
});

const initialData = createService<RootState>(async ({ dispatch }) => {
    try {
        const { pickupPoints } = await CheckoutApi.getInstance().setup();

        if (pickupPoints) {
            dispatch(setInitialPickupPoints(pickupPoints));
        }
    } catch (error) {
        logError(error, { fn: 'setupData' });
    }
});

export const initialSelect = createService<RootState>(async ({ dispatch, getState }) => {
    const state = getState();

    const userState = getUserState(state);
    const sheet = getSheet(state);

    const addressesList = getAddressList(state);
    const contactsList = getContactList(state);

    const hasLastAddressId = hasId(addressesList, userState.addressId);
    const hasLastContactId = hasId(contactsList, userState.contactId);

    const paymentMethodId = getInitialPaymentMethodId(state)(sheet, userState.cardId);
    const addressId = hasLastAddressId ? userState.addressId : getFirstAddressId(state);
    const contactId = hasLastContactId ? userState.contactId : getFirstContactId(state);

    const obSteps = getObSteps(userState, {
        addressId,
        contactId,
        contactsList,
        addressesList,
    });

    const selectOptions = { initialSet: true };

    await Promise.all([
        dispatch(setObSteps(obSteps)),
        dispatch(selectPaymentMethod(paymentMethodId, undefined, selectOptions)),
        dispatch(selectAddress(addressId, undefined, selectOptions)),
        dispatch(selectContact(contactId, undefined, selectOptions)),
    ]);

    const billingFields = getRequiredBillingFields(sheet);

    if (billingFields && billingFields.email) {
        dispatch(setEmail(USER_EMAIL));
    }

    if (obSteps.active) {
        history.replace(obSteps.startHref);
    }
});

export const initializeApp = createService<RootState>(async ({ dispatch, getState }) => {
    pingOpener().catch(() => {
        counters.formLosed({ from: 'initialize' });
        logError('Form losed (from initialize)');
    });

    const adapter = FormConnection.getInstance();

    try {
        await Promise.all([dispatch(loadUserState()), dispatch(waitForSheet())]);

        const state = getState();

        const sheet = getSheet(state);
        const userState = getUserState(state);

        counters.onboardedStatus(userState.isCheckoutOnboarded ? 'onboarded' : 'unonboarded');

        dispatch(setSplitAvailable(isSplitAvailable(sheet)));

        // NB: await не нужен!
        dispatch(initialData());

        await Promise.all([
            dispatch(refreshPaymentMethods(userState.cardId)),
            dispatch(refreshAddressList(userState.addressId)),
            dispatch(refreshContactList()),
            dispatch(loadSplitPlan()),
        ]);

        await dispatch(initialSelect());

        await dispatch(resetPendingScreen());
        await dispatch(resetInitialLoader());

        if (!userState.isCheckoutOnboarded) {
            dispatch(saveUserState({ isCheckoutOnboarded: true }));
        }

        counters.formReady();

        if (CHALLENGE_NUM > 0 && CHALLENGE_CARD_ID) {
            counters.immediateCheckout();
            // Проводим платёж с id карты, которая была выбрана до редиректа на валидацию
            dispatch(startPaymentService(CHALLENGE_CARD_ID));
        }
    } catch (error) {
        console.error(error);
        logError(error, { fn: 'initializeAction' });

        counters.paymentError({
            state: 'load_initial_data',
            message: path(['message'], error),
        });

        dispatch(
            setErrorScreenWithBack({
                ...error,
                description: 'Произошла ошибка при инициализации формы',
                action: () => {
                    adapter.formError(errorReason(error), errorDetails(error));
                },
            }),
        );
    }
});
