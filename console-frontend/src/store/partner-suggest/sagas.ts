import { AxiosResponse } from 'axios';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import { fetchPartnerFailure, fetchPartnerSuccess } from './actions';
import { FETCH_PARTNER_SUGGEST_REQUEST } from './action-types';
import { PartnersSuggestListProps } from 'types/partners-type';
import { FetchPartnerRequest } from './types';
import { getPartnersSuggest } from 'api';

function* fetchPartnerSuggestSaga(action: FetchPartnerRequest) {
  try {
    const response: AxiosResponse<PartnersSuggestListProps> = yield call(() =>
      getPartnersSuggest(action.value),
    );

    yield put(
      fetchPartnerSuccess({
        partners: response.data.data.items,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      fetchPartnerFailure({
        error: e.message,
      }),
    );
  }
}

export function* partnerSuggestSaga() {
  yield all([
    takeLatest(FETCH_PARTNER_SUGGEST_REQUEST, fetchPartnerSuggestSaga),
  ]);
}
