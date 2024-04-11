import {
  PartnerSubmitRequestProps,
  PartnerSubmitPatchRequest,
  PartnerSubmitResponseProps,
  MerchantResponseProps,
  PartnerSubmitPatchResponseProps,
} from 'types/partners-type';

import {
  ProviderSubmitRequestProps,
  ProviderSubmitResponseProps,
  ProviderApplicationSubmitRequestProps,
  ProviderApplicationState,
} from 'types/providers-type';

import {
  FETCH_PARTNER_SUBMIT_REQUEST,
  FETCH_PARTNER_SUBMIT_SUCCESS,
  FETCH_PARTNER_SUBMIT_FAILURE,
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

interface ProviderApplicationProps {
  state: ProviderApplicationState;
  name: string;
}

export interface PartnerSubmitState {
  pending: boolean;
  partner: MerchantResponseProps['data'] | null;
  provider: ProviderSubmitResponseProps['data'] | null;
  providerApplication: ProviderApplicationProps | null;
  error: string | null;
  partnerBeenChecked: boolean;
}

export interface FetchSubmitFailurePayload {
  error: string;
}

/** FetchPartnerSubmit start */
export interface FetchPartnerSubmitSuccessPayload {
  data: MerchantResponseProps['data'] | null;
}

export interface FetchPartnerSubmitRequest {
  type: typeof FETCH_PARTNER_SUBMIT_REQUEST;
  value: PartnerSubmitRequestProps;
  callback: (response: PartnerSubmitResponseProps['data']) => void;
}

export type FetchPartnerSubmitSuccess = {
  type: typeof FETCH_PARTNER_SUBMIT_SUCCESS;
  payload: FetchPartnerSubmitSuccessPayload;
};

export type FetchPartnerSubmitFailure = {
  type: typeof FETCH_PARTNER_SUBMIT_FAILURE;
  payload: FetchSubmitFailurePayload;
};
/** FetchPartnerSubmit end */

/** PatchPartnerSubmit start */
export interface PatchPartnerSubmitRequestPayload {
  value: PartnerSubmitPatchRequest;
  partnerID: string;
}
export interface PatchPartnerSubmitSuccessPayload {
  data: PartnerSubmitResponseProps['data'];
}

export interface PatchPartnerSubmitFailurePayload {
  error: string;
}

export type PatchPartnerSubmitRequest = {
  type: typeof PATCH_PARTNER_SUBMIT_REQUEST;
  payload: PatchPartnerSubmitRequestPayload;
  callback: (response: PartnerSubmitPatchResponseProps['data']) => void;
};

export type PatchPartnerSubmitSuccess = {
  type: typeof PATCH_PARTNER_SUBMIT_SUCCESS;
  payload: PatchPartnerSubmitSuccessPayload;
};

export type PatchPartnerSubmitFailure = {
  type: typeof PATCH_PARTNER_SUBMIT_FAILURE;
  payload: PatchPartnerSubmitFailurePayload;
};
/** PatchPartnerSubmit end */

// /** FetchPartnerSubmit start */
export interface FetchPartnerMerchantsRequest {
  type: typeof FETCH_PARTNER_MERCHANTS_REQUEST;
}

export type FetchPartnerMerchantsSuccess = {
  type: typeof FETCH_PARTNER_MERCHANTS_SUCCESS;
  payload?: FetchPartnerSubmitSuccessPayload;
};

export type FetchPartnerMerchantsFailure = {
  type: typeof FETCH_PARTNER_MERCHANTS_FAILURE;
  payload: FetchSubmitFailurePayload;
};
/** FetchPartnerSubmit end */

/** FetchProviderSubmit start */
export interface FetchProviderSubmitSuccessPayload {
  data: ProviderSubmitResponseProps['data'] | null;
}

export interface FetchProviderSubmitRequest {
  type: typeof FETCH_PROVIDER_SUBMIT_REQUEST;
  merchant_id: string;
  value: Omit<ProviderSubmitRequestProps, 'encrypted'>;
  callback: () => void;
  onCatch?: () => void; // TODO: заменить callback  и onCatch, сделав промисоподобным экшеном
}

export type FetchProviderSubmitSuccess = {
  type: typeof FETCH_PROVIDER_SUBMIT_SUCCESS;
  payload?: FetchProviderSubmitSuccessPayload;
};

export type FetchProviderSubmitFailure = {
  type: typeof FETCH_PROVIDER_SUBMIT_FAILURE;
  payload: FetchSubmitFailurePayload;
};
/** FetchProviderSubmit end */

/** FetchProviderApplicationSubmit start */
export interface FetchProviderApplicationSubmitRequest {
  type: typeof FETCH_PROVIDER_APPLICATION_SUBMIT_REQUEST;
  merchant_id: string;
  provider_name: string;
  fields: ProviderApplicationSubmitRequestProps;
}

export type FetchProviderApplicationSubmitSuccess = {
  type: typeof FETCH_PROVIDER_APPLICATION_SUBMIT_SUCCESS;
  provider_name: string;
};

export type FetchProviderApplicationSubmitFailure = {
  type: typeof FETCH_PROVIDER_APPLICATION_SUBMIT_FAILURE;
  provider_name: string;
};
/** FetchProviderApplicationSubmit end */

export type PartnerSubmitActions =
  | FetchPartnerSubmitSuccess
  | FetchPartnerSubmitFailure
  | FetchPartnerSubmitRequest
  | PatchPartnerSubmitRequest
  | PatchPartnerSubmitSuccess
  | PatchPartnerSubmitFailure
  | FetchPartnerSubmitFailure
  | FetchPartnerSubmitRequest
  | FetchProviderSubmitRequest
  | FetchProviderSubmitSuccess
  | FetchProviderSubmitFailure
  | FetchProviderApplicationSubmitRequest
  | FetchProviderApplicationSubmitSuccess
  | FetchProviderApplicationSubmitFailure
  | FetchPartnerMerchantsRequest
  | FetchPartnerMerchantsSuccess
  | FetchPartnerMerchantsFailure;
