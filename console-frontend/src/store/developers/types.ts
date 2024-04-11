import {
  DELETE_API_KEY,
  DELETE_API_KEY_FAILURE,
  DELETE_API_KEY_SUCCESS,
  FETCH_API_KEYS,
  FETCH_API_KEYS_FAILURE,
  FETCH_API_KEYS_SUCCESS,
  POST_API_KEY,
  POST_API_KEY_FAILURE,
  POST_API_KEY_SUCCESS,
} from './action-types';

import { ApiKeyType } from 'types/api-keys';

export interface FetchApiKeysResponseProps {
  status: string;
  code: number;
  data: {
    keys: ApiKeyType[];
  };
}

export interface PostApiKeyResponseProps {
  status: string;
  code: number;
  data: {
    key: ApiKeyType;
  };
}

export interface DeleteApiKeyResponseProps {
  status: string;
  code: number;
  data: Record<string, never>;
}

export interface FetchApiKeysPayload {
  merchant_id: string;
}

export type FetchApiKeys = {
  type: typeof FETCH_API_KEYS;
  payload: FetchApiKeysPayload;
};

export interface FetchApiKeysSuccessPaylaod {
  keys: ApiKeyType[];
}

export type FetchApiKeysSuccess = {
  type: typeof FETCH_API_KEYS_SUCCESS;
  payload: FetchApiKeysSuccessPaylaod;
};

export type FetchApiKeysFailurePayload = {
  error: string;
};

export type FetchApiKeysFailure = {
  type: typeof FETCH_API_KEYS_FAILURE;
  payload: FetchApiKeysFailurePayload;
};

export type PostApiKeyPayload = FetchApiKeysPayload;

export type PostApiKey = {
  type: typeof POST_API_KEY;
  payload: PostApiKeyPayload;
};

export type PostApiKeyFailurePayload = {
  error: string;
};

export type PostApiKeyFailure = {
  type: typeof POST_API_KEY_FAILURE;
  payload: PostApiKeyFailurePayload;
};

export interface PostApiKeySuccessPaylaod {
  key: ApiKeyType;
}

export type PostApiKeySuccess = {
  type: typeof POST_API_KEY_SUCCESS;
  payload: PostApiKeySuccessPaylaod;
};

export interface DeleteApiKeyPayload extends FetchApiKeysPayload {
  key_id: ApiKeyType['key_id'];
}

export type DeleteApiKey = {
  type: typeof DELETE_API_KEY;
  payload: DeleteApiKeyPayload;
};

export type DeleteApiKeySuccess = {
  type: typeof DELETE_API_KEY_SUCCESS;
};

export type DeleteApiKeyFailurePayload = {
  error: string;
};

export type DeleteApiKeyFailure = {
  type: typeof DELETE_API_KEY_FAILURE;
  payload: DeleteApiKeyFailurePayload;
};

export interface DevelopersState {
  pending: boolean;
  apiKeys: ApiKeyType[];
  newApiKey: ApiKeyType | null;
  error: string | null;
}

export type DevelopersActions =
  | FetchApiKeys
  | FetchApiKeysSuccess
  | FetchApiKeysFailure
  | PostApiKey
  | PostApiKeySuccess
  | PostApiKeyFailure
  | DeleteApiKey
  | DeleteApiKeySuccess
  | DeleteApiKeyFailure;
