import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import { setPartnerDataFailure, setPartnerDataSuccess } from './actions';
import { SET_PARTNER_DATA_REQUEST } from './action-types';

import { postPartnerService } from 'api';
import { SetPartnerDataRequest } from './types';

import { PartnerDataServiceResponseProps } from 'types/partners-type';

function* setPartnerDataSaga(action: SetPartnerDataRequest) {
  try {
    if (action.value.service_name) {
      yield call(
        (): Promise<AxiosResponse<PartnerDataServiceResponseProps>> => {
          return postPartnerService(action.value.service_name);
        },
      );
      if (action.callback) {
        action.callback();
      }
    }
    yield put(
      setPartnerDataSuccess({
        data: action.value,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      setPartnerDataFailure({
        error: e.message,
      }),
    );
  }
}

export function* partnerDataSaga() {
  yield takeLatest(SET_PARTNER_DATA_REQUEST, setPartnerDataSaga);
}
