import { AxiosResponse } from 'axios';
import { all, call, put, takeLatest, select } from 'redux-saga/effects';

import {
  fetchPartnerSubmitFailure,
  fetchPartnerSubmitSuccess,
  fetchProviderSubmitSuccess,
  fetchProviderSubmitFailure,
  fetchProviderApplicationSubmitSuccess,
  fetchProviderApplicationSubmitFailure,
  fetchPartnerMerchantsSuccess,
  fetchPartnerMerchantsFailure,
  patchPartnerSubmitSuccess,
  patchPartnerSubmitFailure,
} from './actions';

import {
  FETCH_PARTNER_SUBMIT_REQUEST,
  FETCH_PROVIDER_SUBMIT_REQUEST,
  FETCH_PROVIDER_APPLICATION_SUBMIT_REQUEST,
  FETCH_PARTNER_MERCHANTS_REQUEST,
  PATCH_PARTNER_SUBMIT_REQUEST,
} from './action-types';

import {
  FetchPartnerSubmitRequest,
  FetchProviderSubmitRequest,
  FetchProviderApplicationSubmitRequest,
  PatchPartnerSubmitRequest,
} from './types';

import {
  PartnerSubmitResponseProps,
  MerchantResponseProps,
  MerchantsListResponseProps,
  PartnersListResponseProps,
  PartnerSubmitPatchResponseProps,
  PartnerSuggestProps,
} from 'types/partners-type';

import {
  ProviderSubmitResponseProps,
  ProviderApplicationSubmitResponseProps,
  ProviderApplicationState,
  ProvidersListResponseProps,
} from 'types/providers-type';

import {
  fetchPartnersSubmit,
  patchPartnersSubmit,
  fetchProviderSubmit,
  fetchProviderApplication,
  createMerchants,
  setOrigins,
  getPartners,
  getMerchants,
  getIntegrations,
} from 'api';

import { getPartnerData } from 'store/partner-data/selectors';
import { setPartnerDataRequest } from 'store/partner-data/actions';

function* setPartnerSubmitSaga(action: FetchPartnerSubmitRequest) {
  try {
    const partnerResponse: AxiosResponse<PartnerSubmitResponseProps['data']> =
      yield call(() =>
        fetchPartnersSubmit(action.value).then((res) => {
          action.callback(res.data);

          return res;
        }),
      );

    const merchantRes: AxiosResponse<MerchantResponseProps['data']> =
      yield call(() =>
        createMerchants(
          partnerResponse.data.partner_id,
          partnerResponse.data.name,
        ).then((res) => {
          setOrigins(
            partnerResponse.data.partner_id,
            res.data.merchant_id,
            res.data.name,
          );

          return res;
        }),
      );

    yield put(
      fetchPartnerSubmitSuccess({
        data: merchantRes.data,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      fetchPartnerSubmitFailure({
        error: e.message,
      }),
    );
  }
}

function* patchPartnerSubmitSaga(action: PatchPartnerSubmitRequest) {
  try {
    const partnerResponse: AxiosResponse<PartnerSubmitResponseProps['data']> =
      yield call(() =>
        patchPartnersSubmit(
          action.payload.value,
          action.payload.partnerID,
        ).then((res) => {
          action.callback(res.data);
          return res;
        }),
      );

    yield put(
      patchPartnerSubmitSuccess({
        data: partnerResponse.data,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      patchPartnerSubmitFailure({
        error: e.message,
      }),
    );
  }
}

function* getPartnerMerchantsSaga() {
  try {
    const partnerResponse: PartnersListResponseProps['data']['partners'][0] =
      yield call(() =>
        getPartners().then((response) => {
          if (response.data.partners.length) {
            return response.data.partners[0];
          }
        }),
      );

    if (partnerResponse && partnerResponse.partner_id) {
      const { registration_data: regData, name } = partnerResponse;

      yield put(
        setPartnerDataRequest({
          kpp: regData.kpp,
          inn: regData.tax_ref_number,
          ogrn: regData.ogrn,
          name,
          address: regData.legal_address,
          full_name: regData.full_company_name,
          leader_name: regData.ceo_name,
          site: '',
          correspondence_address: regData.postal_address,
          email: regData.contact.email,
          phone: regData.contact.phone,
          terms: true,
        }),
      );

      const merchantResponse: AxiosResponse<
        MerchantsListResponseProps['data']
      > = yield call(() => getMerchants(partnerResponse.partner_id));

      const merchant = merchantResponse.data.merchants[0];

      yield put(
        fetchPartnerMerchantsSuccess({
          data: merchant,
        }),
      );

      if (merchant && merchant.merchant_id) {
        const partnerData: PartnerSuggestProps = yield select(getPartnerData);
        const integrationResponse: AxiosResponse<
          ProvidersListResponseProps['data']
        > = yield call(() => getIntegrations(merchant.merchant_id));

        if (partnerData) {
          yield put(
            fetchProviderSubmitSuccess({
              data: integrationResponse.data.integrations[0],
            }),
          );
        } else {
          fetchProviderSubmitSuccess();
        }
      }
    } else {
      yield put(fetchPartnerMerchantsSuccess());
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(
      fetchPartnerMerchantsFailure({
        error: e.message,
      }),
    );
  }
}

function* setProviderSubmitSaga(action: FetchProviderSubmitRequest) {
  try {
    const response: AxiosResponse<ProviderSubmitResponseProps['data']> =
      yield call(() => fetchProviderSubmit(action.merchant_id, action.value));

    action.callback();

    yield put(
      fetchProviderSubmitSuccess({
        data: response.data,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (action.onCatch) {
      action.onCatch();
    }

    yield put(
      fetchProviderSubmitFailure({
        error: e.message,
      }),
    );
  }
}

function* setFutureProviderSubmitSaga(
  action: FetchProviderApplicationSubmitRequest,
) {
  try {
    const response: AxiosResponse<
      ProviderApplicationSubmitResponseProps['data']
    > = yield call(() =>
      fetchProviderApplication(action.merchant_id, action.fields),
    );

    if (response.data.state === ProviderApplicationState.SUCCESSED) {
      yield put(fetchProviderApplicationSubmitSuccess(action.provider_name));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    yield put(fetchProviderApplicationSubmitFailure(action.provider_name));
  }
}

export function* partnerSubmitSaga() {
  yield all([
    takeLatest(FETCH_PARTNER_SUBMIT_REQUEST, setPartnerSubmitSaga),
    takeLatest(PATCH_PARTNER_SUBMIT_REQUEST, patchPartnerSubmitSaga),
    takeLatest(FETCH_PARTNER_MERCHANTS_REQUEST, getPartnerMerchantsSaga),
    takeLatest(FETCH_PROVIDER_SUBMIT_REQUEST, setProviderSubmitSaga),
    takeLatest(
      FETCH_PROVIDER_APPLICATION_SUBMIT_REQUEST,
      setFutureProviderSubmitSaga,
    ),
  ]);
}
