import { PartnerSuggestProps, PartnerDataProps } from 'types/partners-type';

import {
  SET_PARTNER_DATA_REQUEST,
  SET_PARTNER_DATA_FAILURE,
  SET_PARTNER_DATA_SUCCESS,
} from './action-types';

export interface SetPartnerDataSuccessPayload {
  data: PartnerDataProps;
}

export interface SetPartnerDataFailurePayload {
  error: string;
}

export interface SetPartnerDataRequest {
  type: typeof SET_PARTNER_DATA_REQUEST;
  value: PartnerDataProps;
  callback?: () => void;
}

export type SetPartnerDataSuccess = {
  type: typeof SET_PARTNER_DATA_SUCCESS;
  payload: SetPartnerDataSuccessPayload;
};

export type SetPartnerDataFailure = {
  type: typeof SET_PARTNER_DATA_FAILURE;
  payload: SetPartnerDataFailurePayload;
};

export interface PartnerDataState {
  pending: boolean;
  data: PartnerDataProps | null;
  error: string | null;
}

export type PartnerDataActions =
  | SetPartnerDataRequest
  | SetPartnerDataFailure
  | SetPartnerDataSuccess;
