import {
  FETCH_PARTNER_SUGGEST_REQUEST,
  FETCH_PARTNER_SUGGEST_SUCCESS,
  FETCH_PARTNER_SUGGEST_FAILURE,
} from './action-types';

import { PartnerActions, PartnerState } from './types';

const initialState: PartnerState = {
  pending: false,
  partners: null,
  error: null,
};

export const partnerSuggestReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = initialState,
  action: PartnerActions,
) => {
  switch (action.type) {
    case FETCH_PARTNER_SUGGEST_REQUEST:
      return {
        ...state,
        value: action.value,
        pending: true,
      };
    case FETCH_PARTNER_SUGGEST_SUCCESS:
      return {
        ...state,
        pending: false,
        partners: action.payload.partners,
        error: null,
      };
    case FETCH_PARTNER_SUGGEST_FAILURE:
      return {
        ...state,
        pending: false,
        partners: [],
        error: action.payload.error,
      };
    default:
      return {
        ...state,
      };
  }
};
