import {
  FETCH_GEO_SUGGEST_REQUEST,
  FETCH_GEO_SUGGEST_FAILURE,
  FETCH_GEO_SUGGEST_SUCCESS,
} from './action-types';
import {
  FetchGeoRequest,
  FetchGeoSuccess,
  FetchGeoSuccessPayload,
  FetchGeoFailure,
  FetchGeoFailurePayload,
} from './types';

export const fetchGeoRequest = (value: string): FetchGeoRequest => ({
  type: FETCH_GEO_SUGGEST_REQUEST,
  value,
});

export const fetchGeoSuccess = (
  payload: FetchGeoSuccessPayload,
): FetchGeoSuccess => ({
  type: FETCH_GEO_SUGGEST_SUCCESS,
  payload,
});

export const fetchGeoFailure = (
  payload: FetchGeoFailurePayload,
): FetchGeoFailure => ({
  type: FETCH_GEO_SUGGEST_FAILURE,
  payload,
});
