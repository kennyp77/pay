import {
  FETCH_PARTNER_SUBMIT_REQUEST,
  FETCH_PARTNER_SUBMIT_FAILURE,
  FETCH_PARTNER_SUBMIT_SUCCESS,
  FETCH_PROVIDER_SUBMIT_REQUEST,
  FETCH_PROVIDER_SUBMIT_SUCCESS,
  FETCH_PROVIDER_SUBMIT_FAILURE,
  FETCH_PROVIDER_APPLICATION_SUBMIT_REQUEST,
  FETCH_PROVIDER_APPLICATION_SUBMIT_SUCCESS,
  FETCH_PROVIDER_APPLICATION_SUBMIT_FAILURE,
  FETCH_PARTNER_MERCHANTS_REQUEST,
  FETCH_PARTNER_MERCHANTS_SUCCESS,
  FETCH_PARTNER_MERCHANTS_FAILURE,
  PATCH_PARTNER_SUBMIT_REQUEST,
  PATCH_PARTNER_SUBMIT_SUCCESS,
  PATCH_PARTNER_SUBMIT_FAILURE,
} from './action-types';

import {
  FetchPartnerSubmitSuccessPayload,
  FetchSubmitFailurePayload,
  FetchPartnerSubmitRequest,
  FetchPartnerSubmitSuccess,
  FetchPartnerSubmitFailure,
  FetchProviderSubmitSuccessPayload,
  FetchProviderSubmitRequest,
  FetchProviderSubmitSuccess,
  FetchProviderSubmitFailure,
  FetchProviderApplicationSubmitRequest,
  FetchProviderApplicationSubmitSuccess,
  FetchProviderApplicationSubmitFailure,
  FetchPartnerMerchantsRequest,
  FetchPartnerMerchantsSuccess,
  FetchPartnerMerchantsFailure,
  PatchPartnerSubmitRequest,
  PatchPartnerSubmitSuccess,
  PatchPartnerSubmitFailurePayload,
  PatchPartnerSubmitRequestPayload,
  PatchPartnerSubmitFailure,
  PatchPartnerSubmitSuccessPayload,
} from './types';

import {
  PartnerSubmitPatchResponseProps,
  PartnerSubmitRequestProps,
  PartnerSubmitResponseProps,
} from 'types/partners-type';

import {
  ProviderSubmitRequestProps,
  ProviderApplicationSubmitRequestProps,
} from 'types/providers-type';

export const fetchPartnerSubmitRequest = (
  value: PartnerSubmitRequestProps,
  callback: (response: PartnerSubmitResponseProps['data']) => void,
): FetchPartnerSubmitRequest => ({
  type: FETCH_PARTNER_SUBMIT_REQUEST,
  value,
  callback,
});

export const fetchPartnerSubmitSuccess = (
  payload: FetchPartnerSubmitSuccessPayload,
): FetchPartnerSubmitSuccess => ({
  type: FETCH_PARTNER_SUBMIT_SUCCESS,
  payload,
});

export const fetchPartnerSubmitFailure = (
  payload: FetchSubmitFailurePayload,
): FetchPartnerSubmitFailure => ({
  type: FETCH_PARTNER_SUBMIT_FAILURE,
  payload,
});

export const patchPartnerSubmitRequest = (
  payload: PatchPartnerSubmitRequestPayload,
  callback: (response: PartnerSubmitPatchResponseProps['data']) => void,
): PatchPartnerSubmitRequest => ({
  type: PATCH_PARTNER_SUBMIT_REQUEST,
  payload,
  callback,
});

export const patchPartnerSubmitSuccess = (
  payload: PatchPartnerSubmitSuccessPayload,
): PatchPartnerSubmitSuccess => ({
  type: PATCH_PARTNER_SUBMIT_SUCCESS,
  payload,
});

export const patchPartnerSubmitFailure = (
  payload: PatchPartnerSubmitFailurePayload,
): PatchPartnerSubmitFailure => ({
  type: PATCH_PARTNER_SUBMIT_FAILURE,
  payload,
});

export const fetchPartnerMerchantsRequest =
  (): // partner_id: PartnerSubmitResponseProps['data']['partner_id'],
  FetchPartnerMerchantsRequest => ({
    type: FETCH_PARTNER_MERCHANTS_REQUEST,
    // partner_id,
  });

export const fetchPartnerMerchantsSuccess = (
  payload?: FetchPartnerSubmitSuccessPayload,
): FetchPartnerMerchantsSuccess => ({
  type: FETCH_PARTNER_MERCHANTS_SUCCESS,
  payload,
});

export const fetchPartnerMerchantsFailure = (
  payload: FetchSubmitFailurePayload,
): FetchPartnerMerchantsFailure => ({
  type: FETCH_PARTNER_MERCHANTS_FAILURE,
  payload,
});

export const fetchProviderSubmitRequest = (
  merchant_id: string,
  value: Omit<ProviderSubmitRequestProps, 'encrypted'>,
  callback: () => void,
  onCatch?: () => void,
): FetchProviderSubmitRequest => ({
  type: FETCH_PROVIDER_SUBMIT_REQUEST,
  merchant_id,
  value,
  callback,
  onCatch, // TODO: заменить callback  и onCatch, сделав промисоподобным экшеном
});

export const fetchProviderSubmitSuccess = (
  payload?: FetchProviderSubmitSuccessPayload,
): FetchProviderSubmitSuccess => ({
  type: FETCH_PROVIDER_SUBMIT_SUCCESS,
  payload,
});

export const fetchProviderSubmitFailure = (
  payload: FetchSubmitFailurePayload,
): FetchProviderSubmitFailure => ({
  type: FETCH_PROVIDER_SUBMIT_FAILURE,
  payload,
});

export const fetchProviderApplicationSubmitRequest = (
  merchant_id: string,
  provider_name: string,
  fields: ProviderApplicationSubmitRequestProps,
): FetchProviderApplicationSubmitRequest => ({
  type: FETCH_PROVIDER_APPLICATION_SUBMIT_REQUEST,
  merchant_id,
  provider_name,
  fields,
});

export const fetchProviderApplicationSubmitSuccess = (
  provider_name: string,
): FetchProviderApplicationSubmitSuccess => ({
  type: FETCH_PROVIDER_APPLICATION_SUBMIT_SUCCESS,
  provider_name,
});

export const fetchProviderApplicationSubmitFailure = (
  provider_name: string,
): FetchProviderApplicationSubmitFailure => ({
  type: FETCH_PROVIDER_APPLICATION_SUBMIT_FAILURE,
  provider_name,
});
