import {
  SET_PARTNER_DATA_REQUEST,
  SET_PARTNER_DATA_FAILURE,
  SET_PARTNER_DATA_SUCCESS,
} from './action-types';

import { PartnerDataActions, PartnerDataState } from './types';

const initialState: PartnerDataState = {
  pending: false,
  data: null,
  error: null,
};

export const partnerDataReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = initialState,
  action: PartnerDataActions,
) => {
  switch (action.type) {
    case SET_PARTNER_DATA_REQUEST:
      return {
        ...state,
        data: action.value,
        pending: true,
      };
    case SET_PARTNER_DATA_SUCCESS:
      return {
        ...state,
        pending: false,
        data: action.payload.data,
        error: null,
      };
    case SET_PARTNER_DATA_FAILURE:
      return {
        ...state,
        pending: false,
        data: null,
        error: action.payload.error,
      };
    default:
      return {
        ...state,
      };
  }
};
