import { all, fork } from 'redux-saga/effects';

import { partnerSuggestSaga } from './partner-suggest/sagas';
import { partnerSubmitSaga } from './partner-submit/sagas';
import { partnerDataSaga } from './partner-data/sagas';
import { geoSaga } from './geo-suggest/sagas';
import { developersSaga } from './developers/sagas';

export function* rootSaga() {
  yield all([
    fork(partnerSuggestSaga),
    fork(partnerSubmitSaga),
    fork(partnerDataSaga),
    fork(geoSaga),
    fork(developersSaga),
  ]);
}
