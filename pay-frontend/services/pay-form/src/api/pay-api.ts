import * as payApi from '@trust/pay-api';
import { onReject } from '@trust/utils/promise/on-reject';
import { ServerApiModule } from '@yandex-pay/pay-common';

import { CSRF_TOKEN, METRIKA_SESSION_ID } from '../config';

import { handleError } from './utils';

payApi.defineCsrfToken(CSRF_TOKEN);
payApi.defineSessionId(METRIKA_SESSION_ID);

ServerApiModule.setApiHandleError(handleError);

export const checkout = onReject(handleError, payApi.checkout);

export const validate = onReject(handleError, payApi.validate);

export const syncUserCard = onReject(handleError, payApi.syncUserCard);
export const userCards = onReject(handleError, payApi.loadUserCards);

export const getCashback = onReject(handleError, payApi.loadCashback);

export const loadUserSettings = onReject(handleError, payApi.loadUserSettings);
export const updateUserSettings = onReject(handleError, payApi.updateUserSettings);
