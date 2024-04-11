import {
  FETCH_PARTNER_SUGGEST_REQUEST,
  FETCH_PARTNER_SUGGEST_FAILURE,
  FETCH_PARTNER_SUGGEST_SUCCESS,
} from './action-types';
import {
  FetchPartnerRequest,
  FetchPartnerSuccess,
  FetchPartnerSuccessPayload,
  FetchPartnerFailure,
  FetchPartnerFailurePayload,
} from './types';

export const fetchPartnerRequest = (value: string): FetchPartnerRequest => ({
  type: FETCH_PARTNER_SUGGEST_REQUEST,
  value,
});

export const fetchPartnerSuccess = (
  payload: FetchPartnerSuccessPayload,
): FetchPartnerSuccess => ({
  type: FETCH_PARTNER_SUGGEST_SUCCESS,
  payload,
});

export const fetchPartnerFailure = (
  payload: FetchPartnerFailurePayload,
): FetchPartnerFailure => ({
  type: FETCH_PARTNER_SUGGEST_FAILURE,
  payload,
});
