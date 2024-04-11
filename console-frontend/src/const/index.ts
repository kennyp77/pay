export const axiosStoreUrl =
  process.env.NEXT_PUBLIC_RESTAPIFY || 'http://localhost:6767';

export const serverСonfig = {
  port: 3000,
  isDev: true,
};

export const apiVersion = '/api/web/v1';

export const apiMethods = {
  captcha: '/captcha',
  paymentSuggest: `${apiVersion}/partners/suggest`,
  geoSuggest: `${apiVersion}/geo/suggest`,
  partnerSubmit: `${apiVersion}/partners`,
  partnerCheck: `${apiVersion}/partners/check`,
  partnerService: `${apiVersion}/partners/service`,
  partnerSubmitPatch: (partnerID: string) => {
    return `${apiMethods.partnerSubmit}/${partnerID}`;
  },
  merchants: (partnerID: string) => {
    return `${apiMethods.partnerSubmit}/${partnerID}/merchants`;
  },
  origins: (partnerID: string, merchantID: string) => {
    return `${apiMethods.partnerSubmit}/${partnerID}/merchants/${merchantID}/origins`;
  },
  merchantsIntegrations: (merchantID: string) => {
    return `${apiVersion}/merchants/${merchantID}/integrations`;
  },
  providerApplication: (merchantID: string) => {
    return `${apiVersion}/merchants/${merchantID}/application`;
  },
  merchantsApiKeys: (merchantID: string) => {
    return `${apiVersion}/merchants/${merchantID}/keys`;
  },
};

export const queryParams = {
  partnerId: 'partner-id',
  merchantId: 'merchant-id',
};

export const routes = {
  registration: {
    stepOne: '/registration',
    stepTwo: '/registration/providers',
    stepThree: '/registration/services',
  },
  account: {
    main: '/account',
    services: '/account/services',
    payments: '/account/payments',
    about: '/account/about',
    developers: '/account/developers',
    bills: '/account/bills',
  },
};

export const breakpoints = {
  tablet: '768px',
  tabletHorizontal: '1024px',
  desktop: '1280px',
  desktopFull: '1920px',
};

// Must be synchronized with a property 'basePath' in next.config.js
export const basePath = '/web';
