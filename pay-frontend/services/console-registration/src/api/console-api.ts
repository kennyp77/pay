import * as consoleApi from '@trust/console-api';
import { onReject } from '@trust/utils/promise/on-reject';

import { CSRF_TOKEN, METRIKA_SESSION_ID } from '../config';

import { handleError } from './utils';

consoleApi.defineCsrfToken(CSRF_TOKEN);
consoleApi.defineSessionId(METRIKA_SESSION_ID);

export const getPartners = onReject(handleError, consoleApi.getPartners);
export const registerMerchant = onReject(handleError, consoleApi.registerMerchant);
export const createMerchantIntegration = onReject(
    handleError,
    consoleApi.createMerchantIntegration,
);
export const createMerchantKey = onReject(handleError, consoleApi.createMerchantKey);
