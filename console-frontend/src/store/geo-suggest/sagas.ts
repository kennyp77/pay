import { AxiosResponse } from 'axios';
import { api } from 'utils/axios-instance';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import { apiMethods } from 'const';

import { fetchGeoFailure, fetchGeoSuccess } from './actions';
import { FETCH_GEO_SUGGEST_REQUEST } from './action-types';
import { GeoSuggestProps, GeoSuggestListProps } from 'types/geo-type';
import { FetchGeoRequest } from './types';

const getGeo = (value?: string) =>
  api.get<GeoSuggestProps[]>(
    `${apiMethods.geoSuggest}${value ? `?q=${value}` : ''}`,
  );

function* fetchGeoSuggestSaga(action: FetchGeoRequest) {
  try {
    const response: AxiosResponse<GeoSuggestListProps> = yield call(() =>
      getGeo(action.value),
    );

    yield put(
      fetchGeoSuccess({
        geo: response.data.data,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      fetchGeoFailure({
        error: e.message,
      }),
    );
  }
}

export function* geoSaga() {
  yield all([takeLatest(FETCH_GEO_SUGGEST_REQUEST, fetchGeoSuggestSaga)]);
}
