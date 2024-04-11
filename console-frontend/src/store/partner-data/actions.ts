import {
  SET_PARTNER_DATA_REQUEST,
  SET_PARTNER_DATA_FAILURE,
  SET_PARTNER_DATA_SUCCESS,
} from './action-types';

import {
  SetPartnerDataRequest,
  SetPartnerDataFailure,
  SetPartnerDataFailurePayload,
  SetPartnerDataSuccess,
  SetPartnerDataSuccessPayload,
} from './types';

import { PartnerDataProps } from 'types/partners-type';

export const setPartnerDataRequest = (
  value: PartnerDataProps,
  callback?: () => void,
): SetPartnerDataRequest => ({
  type: SET_PARTNER_DATA_REQUEST,
  value,
  callback,
});

export const setPartnerDataSuccess = (
  payload: SetPartnerDataSuccessPayload,
): SetPartnerDataSuccess => ({
  type: SET_PARTNER_DATA_SUCCESS,
  payload,
});

export const setPartnerDataFailure = (
  payload: SetPartnerDataFailurePayload,
): SetPartnerDataFailure => ({
  type: SET_PARTNER_DATA_FAILURE,
  payload,
});
