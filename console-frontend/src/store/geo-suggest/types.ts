import { GeoSuggestProps } from 'types/geo-type';

import {
  FETCH_GEO_SUGGEST_REQUEST,
  FETCH_GEO_SUGGEST_SUCCESS,
  FETCH_GEO_SUGGEST_FAILURE,
} from './action-types';

export interface FetchGeoSuccessPayload {
  geo: GeoSuggestProps[];
}

export interface FetchGeoFailurePayload {
  error: string;
}

export interface FetchGeoRequest {
  type: typeof FETCH_GEO_SUGGEST_REQUEST;
  value: string;
}

export type FetchGeoSuccess = {
  type: typeof FETCH_GEO_SUGGEST_SUCCESS;
  payload: FetchGeoSuccessPayload;
};

export type FetchGeoFailure = {
  type: typeof FETCH_GEO_SUGGEST_FAILURE;
  payload: FetchGeoFailurePayload;
};

export interface GeoState {
  pending: boolean;
  geo: GeoSuggestProps[];
  error: string | null;
}

export type GeoActions = FetchGeoRequest | FetchGeoSuccess | FetchGeoFailure;
