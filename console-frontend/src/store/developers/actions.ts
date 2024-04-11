import {
  FETCH_API_KEYS,
  FETCH_API_KEYS_SUCCESS,
  POST_API_KEY,
  POST_API_KEY_SUCCESS,
  DELETE_API_KEY,
  DELETE_API_KEY_SUCCESS,
  DELETE_API_KEY_FAILURE,
  POST_API_KEY_FAILURE,
  FETCH_API_KEYS_FAILURE,
} from './action-types';

import {
  FetchApiKeysSuccessPaylaod,
  FetchApiKeysFailure,
  FetchApiKeysFailurePayload,
  PostApiKeySuccessPaylaod,
  PostApiKeyFailure,
  PostApiKeyFailurePayload,
  DeleteApiKey,
  DeleteApiKeyPayload,
  DeleteApiKeySuccess,
  DeleteApiKeyFailure,
  DeleteApiKeyFailurePayload,
  PostApiKey,
  PostApiKeyPayload,
  PostApiKeySuccess,
  FetchApiKeys,
  FetchApiKeysSuccess,
  FetchApiKeysPayload,
} from './types';

export const fetchApiKeys = (payload: FetchApiKeysPayload): FetchApiKeys => ({
  type: FETCH_API_KEYS,
  payload,
});

export const fetchApiKeysSuccess = (
  payload: FetchApiKeysSuccessPaylaod,
): FetchApiKeysSuccess => ({
  type: FETCH_API_KEYS_SUCCESS,
  payload,
});

export const fetchApiKeysFailure = (
  payload: FetchApiKeysFailurePayload,
): FetchApiKeysFailure => ({
  type: FETCH_API_KEYS_FAILURE,
  payload,
});

export const postApiKey = (payload: PostApiKeyPayload): PostApiKey => ({
  type: POST_API_KEY,
  payload,
});

export const postApiKeySuccess = (
  payload: PostApiKeySuccessPaylaod,
): PostApiKeySuccess => ({
  type: POST_API_KEY_SUCCESS,
  payload,
});

export const postApiKeyFailure = (
  payload: PostApiKeyFailurePayload,
): PostApiKeyFailure => ({
  type: POST_API_KEY_FAILURE,
  payload,
});

export const deleteApiKey = (payload: DeleteApiKeyPayload): DeleteApiKey => ({
  type: DELETE_API_KEY,
  payload,
});

export const deleteApiKeySuccess = (): DeleteApiKeySuccess => ({
  type: DELETE_API_KEY_SUCCESS,
});

export const deleteApiKeyFailure = (
  payload: DeleteApiKeyFailurePayload,
): DeleteApiKeyFailure => ({
  type: DELETE_API_KEY_FAILURE,
  payload,
});
