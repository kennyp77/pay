import pathOr from '@tinkoff/utils/object/pathOr';
import { FetchHttpError } from '@trust/fetch';
import * as payApi from '@trust/pay-api';
import { onReject } from '@trust/utils/promise/on-reject';

import { CSRF_TOKEN, METRIKA_SESSION_ID } from './config';

payApi.defineCsrfToken(CSRF_TOKEN);
payApi.defineSessionId(METRIKA_SESSION_ID);

const returnFailResult = async (err: Error | FetchHttpError): Promise<string> => {
    const getDataMessage = pathOr(['data', 'message'], 'UNKNOWN_ERROR', err);
    throw new Error(getDataMessage);
};

export const checkout = onReject(returnFailResult, payApi.checkout);
export const validate = onReject(returnFailResult, payApi.validate);
export const loadUserCards = onReject(returnFailResult, payApi.loadUserCards);
export const loadContacts = onReject(returnFailResult, payApi.loadContacts);
export const loadAddresses = onReject(returnFailResult, payApi.loadAddresses);

export const renderOrder = onReject(returnFailResult, payApi.renderOrder);
export const createOrder = onReject(returnFailResult, payApi.createOrder);
