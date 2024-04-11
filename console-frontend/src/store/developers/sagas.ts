import { AxiosResponse } from 'axios';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import {
  deleteApiKeySuccess,
  deleteApiKeyFailure,
  fetchApiKeysSuccess,
  postApiKeySuccess,
  postApiKeyFailure,
  fetchApiKeys,
  fetchApiKeysFailure,
} from './actions';
import { DELETE_API_KEY, FETCH_API_KEYS, POST_API_KEY } from './action-types';

import {
  deleteMerchantsApiKey,
  getMerchantsApiKeys,
  postMerchantsApiKey,
} from 'api';
import {
  FetchApiKeysResponseProps,
  FetchApiKeys,
  PostApiKeyResponseProps,
  PostApiKey,
  DeleteApiKey,
  DeleteApiKeyResponseProps,
} from './types';

function* fetchApiKeysLocal(action: FetchApiKeys) {
  try {
    const response: AxiosResponse<FetchApiKeysResponseProps> = yield call(() =>
      getMerchantsApiKeys(action.payload.merchant_id),
    );

    yield put(fetchApiKeysSuccess(response.data.data));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      fetchApiKeysFailure({
        error: e.message,
      }),
    );
  }
}

function* postApiKey(action: PostApiKey) {
  try {
    const response: AxiosResponse<PostApiKeyResponseProps> = yield call(() =>
      postMerchantsApiKey(action.payload.merchant_id),
    );

    yield put(postApiKeySuccess(response.data.data));

    yield put(fetchApiKeys({ merchant_id: action.payload.merchant_id }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      postApiKeyFailure({
        error: e.message,
      }),
    );
  }
}

function* deleteApiKey(action: DeleteApiKey) {
  try {
    yield call(
      (): Promise<AxiosResponse<DeleteApiKeyResponseProps>> =>
        deleteMerchantsApiKey(
          action.payload.merchant_id,
          action.payload.key_id,
        ),
    );

    yield put(deleteApiKeySuccess());

    yield put(fetchApiKeys({ merchant_id: action.payload.merchant_id }));
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yield put(
      deleteApiKeyFailure({
        error: e.message,
      }),
    );
  }
}

export function* developersSaga() {
  yield all([
    takeLatest(FETCH_API_KEYS, fetchApiKeysLocal),
    takeLatest(POST_API_KEY, postApiKey),
    takeLatest(DELETE_API_KEY, deleteApiKey),
  ]);
}
