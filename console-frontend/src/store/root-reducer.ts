import { combineReducers } from 'redux';

import { partnerSuggestReducer } from './partner-suggest/reducer';
import { partnerDataReducer } from './partner-data/reducer';
import { partnerSubmitReducer } from './partner-submit/reducer';
import { geoSuggestReducer } from './geo-suggest/reducer';
import { developersReducer } from './developers/reducer';

export const rootReducer = combineReducers({
  partnerSuggest: partnerSuggestReducer,
  partnerData: partnerDataReducer,
  partnerSubmit: partnerSubmitReducer,
  geoSuggest: geoSuggestReducer,
  developers: developersReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
