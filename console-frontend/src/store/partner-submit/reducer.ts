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

import { PartnerSubmitActions, PartnerSubmitState } from './types';

import { ProviderApplicationState } from 'types/providers-type';

const initialState: PartnerSubmitState = {
  pending: false,
  partner: null,
  provider: null,
  providerApplication: null,
  error: null,
  partnerBeenChecked: false,
};

export const partnerSubmitReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = initialState,
  action: PartnerSubmitActions,
) => {
  switch (action.type) {
    case FETCH_PARTNER_SUBMIT_REQUEST:
      return {
        ...state,
        pending: true,
      };
    case FETCH_PARTNER_SUBMIT_SUCCESS:
      return {
        ...state,
        pending: false,
        partner: action.payload.data,
        error: null,
      };

    case FETCH_PARTNER_SUBMIT_FAILURE:
      return {
        ...state,
        pending: false,
        partner: null,
        error: action.payload.error,
      };
    case PATCH_PARTNER_SUBMIT_REQUEST:
      return {
        ...state,
        pending: true,
      };
    case PATCH_PARTNER_SUBMIT_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
      };
    case PATCH_PARTNER_SUBMIT_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.payload.error,
      };
    case FETCH_PARTNER_MERCHANTS_REQUEST:
      return {
        ...state,
        pending: true,
      };
    case FETCH_PARTNER_MERCHANTS_SUCCESS:
      return {
        ...state,
        pending: false,
        partner: action.payload ? action.payload.data : null,
        error: null,
        partnerBeenChecked: true,
      };
    case FETCH_PARTNER_MERCHANTS_FAILURE:
      return {
        ...state,
        pending: false,
        partner: null,
        error: action.payload.error,
        partnerBeenChecked: true,
      };

    case FETCH_PROVIDER_SUBMIT_REQUEST:
      return {
        ...state,
        pending: true,
      };

    case FETCH_PROVIDER_SUBMIT_SUCCESS:
      return {
        ...state,
        pending: false,
        provider: action.payload ? action.payload.data : null,
        error: null,
      };

    case FETCH_PROVIDER_SUBMIT_FAILURE:
      return {
        ...state,
        pending: false,
        provider: null,
        error: action.payload.error,
      };

    case FETCH_PROVIDER_APPLICATION_SUBMIT_REQUEST:
      return {
        ...state,
        providerApplication: {
          name: action.provider_name,
          state: ProviderApplicationState.PROCESSING,
        },
        pending: true,
      };

    case FETCH_PROVIDER_APPLICATION_SUBMIT_SUCCESS:
      return {
        ...state,
        providerApplication: {
          ...state.providerApplication,
          name: action.provider_name,
          state: ProviderApplicationState.SUCCESSED,
        },
        pending: false,
      };

    case FETCH_PROVIDER_APPLICATION_SUBMIT_FAILURE:
      return {
        ...state,
        providerApplication: {
          ...state.providerApplication,
          name: action.provider_name,
          state: ProviderApplicationState.CANCELED,
        },
        pending: false,
      };
    default:
      return {
        ...state,
      };
  }
};
