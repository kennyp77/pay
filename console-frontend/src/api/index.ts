import { api, serverApi } from 'utils/axios-instance';

import { apiMethods } from 'const';
import { GeoSuggestListProps } from 'types/geo-type';
import {
  ProviderApplicationSubmitRequestProps,
  ProviderApplicationSubmitResponseProps,
} from 'types/providers-type';

import { queryParams } from 'const';

import {
  PartnerSuggestProps,
  PartnerSubmitRequestProps,
  PartnerSubmitPatchRequest,
  MerchantResponseProps,
  MerchantsListResponseProps,
  PartnerSubmitResponseProps,
  PartnersListResponseProps,
} from 'types/partners-type';

import {
  ProviderSubmitRequestProps,
  ProviderSubmitResponseProps,
  ProvidersListResponseProps,
} from 'types/providers-type';

export const getCaptcha = async () => {
  const response = await api.get(apiMethods.captcha);

  return response.data;
};

export const checkPartnerID = async (id: string) => {
  const response = await api.get(
    `${apiMethods.partnerCheck}?${queryParams.partnerId}=${id}`,
  );
  return response;
};

export const getPartnersSuggest = (value?: string) => {
  return serverApi.get<PartnerSuggestProps[]>(
    `${apiMethods.paymentSuggest}${
      value ? `?query=${encodeURIComponent(value)}` : ''
    }`,
  );
};

export const fetchPartnersSubmit = async (value: PartnerSubmitRequestProps) => {
  const response = await serverApi.post<PartnerSubmitResponseProps>(
    `${apiMethods.partnerSubmit}`,
    value,
  );

  return response.data;
};

export const patchPartnersSubmit = async (
  value: PartnerSubmitPatchRequest,
  partnerID: string,
) => {
  const response = await serverApi.patch<PartnerSubmitResponseProps>(
    apiMethods.partnerSubmitPatch(partnerID),
    value,
  );

  return response.data;
};

export const getPartners = async () => {
  const response = await serverApi.get<PartnersListResponseProps>(
    apiMethods.partnerSubmit,
  );

  return response.data;
};

export const fetchProviderSubmit = async (
  merchantID: string,
  value: Omit<ProviderSubmitRequestProps, 'encrypted'>,
) => {
  const response = await serverApi.post<ProviderSubmitResponseProps>(
    `${apiMethods.merchantsIntegrations(merchantID)}`,
    {
      psp_external_id: value.psp_external_id,
      creds: value.creds,
    },
  );

  return response.data;
};

export const getIntegrations = async (merchantID: string) => {
  const response = await serverApi.get<ProvidersListResponseProps>(
    apiMethods.merchantsIntegrations(merchantID),
  );

  return response.data;
};

export const createMerchants = async (partnerID: string, name: string) => {
  const response = await serverApi.post<MerchantResponseProps>(
    `${apiMethods.merchants(partnerID)}`,
    {
      name,
    },
  );

  return response.data;
};

export const getMerchants = async (partnerID: string) => {
  const response = await serverApi.get<MerchantsListResponseProps>(
    apiMethods.merchants(partnerID),
  );

  return response.data;
};

export const setOrigins = async (
  partnerID: string,
  merchantID: string,
  origin: string,
) => {
  const response = await api.post(
    `${apiMethods.origins(partnerID, merchantID)}`,
    { origin },
  );
  return response.data;
};

export const fetchProviderApplication = async (
  merchantID: string,
  fields: ProviderApplicationSubmitRequestProps,
) => {
  const response = await api.post<ProviderApplicationSubmitResponseProps>(
    `${apiMethods.providerApplication(merchantID)}`,
    { fields },
  );
  return response.data;
};

export const postPartnerService = (service: string | undefined) => {
  return api.post(`${apiMethods.partnerService}`, { service });
};

export const getGeoSuggest = (value?: string) => {
  return api.get<GeoSuggestListProps[]>(
    `${apiMethods.geoSuggest}${value ? `?q=${encodeURIComponent(value)}` : ''}`,
  );
};

export const getMerchantsApiKeys = (merchantID: string) => {
  return serverApi.get(apiMethods.merchantsApiKeys(merchantID));
};

export const postMerchantsApiKey = (merchantID: string) => {
  return serverApi.post(apiMethods.merchantsApiKeys(merchantID));
};

export const deleteMerchantsApiKey = (merchantID: string, keyID: string) => {
  return serverApi.delete(apiMethods.merchantsApiKeys(merchantID), {
    data: { key_id: keyID },
  });
};
