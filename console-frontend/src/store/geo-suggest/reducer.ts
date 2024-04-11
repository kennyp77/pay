import {
  FETCH_GEO_SUGGEST_REQUEST,
  FETCH_GEO_SUGGEST_SUCCESS,
  FETCH_GEO_SUGGEST_FAILURE,
} from './action-types';

import { GeoActions, GeoState } from './types';

const initialState: GeoState = {
  pending: false,
  geo: [],
  error: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
export const geoSuggestReducer = (state = initialState, action: GeoActions) => {
  switch (action.type) {
    case FETCH_GEO_SUGGEST_REQUEST:
      return {
        ...state,
        value: action.value,
        pending: true,
      };
    case FETCH_GEO_SUGGEST_SUCCESS:
      return {
        ...state,
        pending: false,
        geo: action.payload.geo,
        error: null,
      };
    case FETCH_GEO_SUGGEST_FAILURE:
      return {
        ...state,
        pending: false,
        geo: [],
        error: action.payload.error,
      };
    default:
      return {
        ...state,
      };
  }
};
