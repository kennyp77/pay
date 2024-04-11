import { Template, Theme } from '@trust/ui/typings';
import { Experiment } from '@trust/utils/experiment';
import { createGetter } from '@trust/utils/object';
import { getSearchParams, getSource } from '@trust/utils/url';
import { CurrencyCode } from '@yandex-pay/sdk/src/typings';

import { isScreenLessThan } from './helpers/window';
import { MAP_INITIAL_CENTER } from './store/map';

const configGetter = createGetter(window.__CONFIG);
const queryGetter = createGetter(getSearchParams(getSource()));

export const ENV = configGetter('env', 'production');
export const REQ_ID = configGetter('reqid', '0');

export const UID = configGetter('uid', '');
export const CSRF_TOKEN = configGetter('csrfToken', '');

export const TEMPLATE = isScreenLessThan(768) ? Template.Touch : Template.Desktop;

export const THEME = queryGetter('theme') === 'dark' ? Theme.Dark : Theme.Default;

export const BASE_ROUTE = '/web/checkout';

export const METRIKA_ID = configGetter('metrikaId', '0');
export const METRIKA_SESSION_ID = configGetter<string>('metrikaSessionId') || 'no-sid';
export const METRIKA_CHECKOUT_ID = configGetter<string>('metrikaCheckoutId') || 'no-cid';
export const METRIKA_CLICK_BINDING_NUM = queryGetter<string>('mcnb') || '1';
export const METRIKA_PAYMENT_SELECT_NUM = queryGetter<string>('mpsn') || '1';
export const EXPERIMENT = configGetter<Experiment>('experiment');
export const CHALLENGE_NUM = Number(queryGetter<string>('chn') || '0');
export const CHALLENGE_CARD_ID = queryGetter<string>('chnCardId', '');

export const USER_EMAIL = configGetter<string>(['user', 'email'], '');
export const USER_FIRST_NAME = configGetter<string>(['user', 'firstName'], '');
export const USER_LAST_NAME = configGetter<string>(['user', 'lastName'], '');

export const PROFILE_URL = configGetter<string>('profileUrl', '');
export const USER_LOCATION_COORDS = configGetter<Sdk.GeoPoint>(
    ['user', 'location'],
    MAP_INITIAL_CENTER,
);

export const API_GEO_HOST = configGetter<string>(['services', 'geo']);
export const API_TRUST_HOST = configGetter<string>(['services', 'trust']);
export const API_TRUST_SERVICE_TOKEN = configGetter<string>(['services', 'trustServiceToken']);
export const API_PREFIX = configGetter<string>('apiPrefix', '');
export const FRAME_URL_WHITELIST = configGetter<string[]>('frameUrlWhitelist', []);

export const MAX_BOUND_CARDS = 5;
export const MAX_CHALLENGE_REDIRECT = 3;
export const AGREEMENT_HREF = 'https://yandex.ru/legal/token_pay_termsofuse/';

export const MAP_API_KEY = configGetter<string>(
    ['services', 'mapApiKey'],
    'afe8f728-7a72-4b37-b4f3-7da6d1e1e311',
);

export const SERVICE_OWNER_PAY = 'pay';
export const SERVICE_OWNER_PASSPORT = 'passport';
export const SERVICE_OWNER_MARKET = 'market';

export const CHALLENGE_LIMIT_EXCEEDED = CHALLENGE_NUM >= MAX_CHALLENGE_REDIRECT;

export const IS_SPLIT_AVAILABLE = configGetter<boolean>(['features', 'split'], false);
export const SPLIT_MERCHANT_WHITELIST = configGetter<string[]>(['split', 'merchantId'], []);
export const SPLIT_AVAILABLE_AMOUNT_RANGE = configGetter<number[]>(['split', 'amountRange'], []);

export const IS_CHECKOUT_SERVER = queryGetter<string>('pt', '') === 'checkout-v3';
