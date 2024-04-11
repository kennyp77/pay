import * as payApi from '@trust/pay-api';
import { onReject } from '@trust/utils/promise/on-reject';
import { ServerApiModule } from '@yandex-pay/pay-common';

import { CSRF_TOKEN, METRIKA_SESSION_ID, API_PREFIX } from '../config';

import { handleError } from './utils';

if (API_PREFIX) {
    payApi.defineApiPathFixer(['/api/v1', API_PREFIX]);
}

payApi.defineCsrfToken(CSRF_TOKEN);
payApi.defineSessionId(METRIKA_SESSION_ID);

ServerApiModule.setApiHandleError(handleError);

export const validate = onReject(handleError, payApi.validate);
export const checkout = onReject(handleError, payApi.checkout);

export const syncUserCard = onReject(handleError, payApi.syncUserCard);
export const loadUserCards = onReject(handleError, payApi.loadUserCards);

export const loadCashback = onReject(handleError, payApi.loadCashback);
export const loadAddressGeocode = onReject(handleError, payApi.loadAddressGeocode);

export const loadAddresses = onReject(handleError, payApi.loadAddresses);
export const createAddress = onReject(handleError, payApi.createAddress);
export const updateAddress = onReject(handleError, payApi.updateAddress);
export const deleteAddress = onReject(handleError, payApi.deleteAddress);

export const loadContacts = onReject(handleError, payApi.loadContacts);
export const createContact = onReject(handleError, payApi.createContact);
export const updateContact = onReject(handleError, payApi.updateContact);
export const deleteContact = onReject(handleError, payApi.deleteContact);

export const loadUserSettings = onReject(handleError, payApi.loadUserSettings);
export const updateUserSettings = onReject(handleError, payApi.updateUserSettings);

export const loadSplitPlans = onReject(handleError, payApi.loadSplitPlans);
