import { PartnerSuggestProps } from 'types/partners-type';

import {
  FETCH_PARTNER_SUGGEST_REQUEST,
  FETCH_PARTNER_SUGGEST_SUCCESS,
  FETCH_PARTNER_SUGGEST_FAILURE,
} from './action-types';

export interface FetchPartnerSuccessPayload {
  partners: PartnerSuggestProps[];
}

export interface FetchPartnerFailurePayload {
  error: string;
}

export interface FetchPartnerRequest {
  type: typeof FETCH_PARTNER_SUGGEST_REQUEST;
  value: string;
}

export type FetchPartnerSuccess = {
  type: typeof FETCH_PARTNER_SUGGEST_SUCCESS;
  payload: FetchPartnerSuccessPayload;
};

export type FetchPartnerFailure = {
  type: typeof FETCH_PARTNER_SUGGEST_FAILURE;
  payload: FetchPartnerFailurePayload;
};

export interface PartnerState {
  pending: boolean;
  partners: PartnerSuggestProps[] | null;
  error: string | null;
}

export type PartnerActions =
  | FetchPartnerRequest
  | FetchPartnerSuccess
  | FetchPartnerFailure;
