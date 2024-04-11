import {
  FETCH_API_KEYS,
  FETCH_API_KEYS_SUCCESS,
  FETCH_API_KEYS_FAILURE,
  POST_API_KEY,
  POST_API_KEY_SUCCESS,
  POST_API_KEY_FAILURE,
  DELETE_API_KEY,
  DELETE_API_KEY_SUCCESS,
  DELETE_API_KEY_FAILURE,
} from './action-types';

import { DevelopersActions, DevelopersState } from './types';

const initialState: DevelopersState = {
  pending: false,
  apiKeys: [],
  newApiKey: null,
  error: null,
};

export const developersReducer = (
  state = initialState,
  action: DevelopersActions,
) => {
  switch (action.type) {
    case FETCH_API_KEYS:
      return {
        ...state,
        pending: true,
      };
    case FETCH_API_KEYS_SUCCESS:
      return {
        ...state,
        pending: false,
        apiKeys: action.payload.keys,
        error: null,
      };
    case FETCH_API_KEYS_FAILURE:
      return {
        ...state,
        pending: false,
        apiKeys: [],
        error: action.payload.error,
      };
    case POST_API_KEY:
      return {
        ...state,
        pending: true,
      };
    case POST_API_KEY_SUCCESS:
      return {
        ...state,
        pending: false,
        newApiKey: action.payload.key,
        error: null,
      };
    case POST_API_KEY_FAILURE:
      return {
        ...state,
        pending: false,
        newApiKey: null,
        error: action.payload.error,
      };
    case DELETE_API_KEY:
      return {
        ...state,
        pending: true,
      };
    case DELETE_API_KEY_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
      };
    case DELETE_API_KEY_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.payload.error,
      };
    default:
      return {
        ...state,
      };
  }
};
