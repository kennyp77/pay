import { Experiment } from '@trust/utils/experiment';
import { createGetter } from '@trust/utils/object';
import { getSource, getSearchParams } from '@trust/utils/url';

const configGetter = createGetter(window.__CONFIG);
const queryGetter = createGetter(getSearchParams(getSource()));
const URL_PARAMS = new URLSearchParams(window.location.search);

export const ENV = configGetter('env', 'production');
export const REQ_ID = configGetter('reqid', '0');

export const UID = configGetter('uid', '');
export const USER_EMAIL = configGetter('email', '');
export const CSRF_TOKEN = configGetter('csrfToken', '');

export const METRIKA_ID = configGetter('metrikaId', '0');
export const EXPERIMENT = configGetter<Experiment>('experiment');

export const YAPAY_MESSAGE_SOURCE = 'yandex-pay';
export const YAPAY_MESSAGE_TYPE = 'merchant-data';
export const YAPAY_ERROR_TYPE = 'error';

export const MERCHANT_DOMAINS = URL_PARAMS.get('domains')?.split(',').filter(Boolean);
export const MERCHANT_NAME = URL_PARAMS.get('name');
