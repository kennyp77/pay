import { Template, Theme } from '@trust/ui/typings';
import { IThemeSettings } from '@trust/ui/typings/theme';
import { Experiment } from '@trust/utils/experiment';
import { createGetter } from '@trust/utils/object';
import { getSource, getSearchParams } from '@trust/utils/url';

import { isScreenLessThan } from './helpers/window';

const configGetter = createGetter(window.__CONFIG);
const queryGetter = createGetter(getSearchParams(getSource()));

const getTemplateByWindowSize = (): string | void =>
    isScreenLessThan(530) ? 'mobile/form' : undefined;

export const ENV = configGetter('env', 'production');
export const REQ_ID = configGetter('reqid', '0');

export const UID = configGetter('uid', '');
export const CSRF_TOKEN = configGetter('csrfToken', '');

export const TEMPLATE =
    queryGetter('template_tag', getTemplateByWindowSize()) === 'mobile/form'
        ? Template.Mobile
        : Template.Desktop;

export const THEME = queryGetter('theme_tag') === 'dark' ? Theme.Dark : Theme.Default;

export const METRIKA_ID = configGetter('metrikaId', '0');
export const METRIKA_SESSION_ID = configGetter<string>('metrikaSessionId') || 'no-sid';
export const METRIKA_CHECKOUT_ID = configGetter<string>('metrikaCheckoutId') || 'no-cid';
export const METRIKA_CLICK_BINDING_NUM = queryGetter<string>('mcnb') || '1';
export const METRIKA_PAYMENT_SELECT_NUM = queryGetter<string>('mpsn') || '1';
export const EXPERIMENT = configGetter<Experiment>('experiment');
export const USER_EMAIL = configGetter<string>('userEmail', '');
export const USER_NAME = configGetter<string>('userName', '');
export const CHALLENGE_NUM = Number(queryGetter<string>('chn') || '0');
export const CHALLENGE_CARD_ID = queryGetter<string>('chnCardId', '');

export const API_TRUST_HOST = configGetter<string>(['services', 'trust']);
export const API_TRUST_SERVICE_TOKEN = configGetter<string>(['services', 'trustServiceToken']);
export const FRAME_URL_WHITELIST = configGetter<string[]>('frameUrlWhitelist', []);

export const MAX_BOUND_CARDS = 5;
export const MAX_CHALLENGE_REDIRECT = 3;

export const CHALLENGE_LIMIT_EXCEEDED = CHALLENGE_NUM >= MAX_CHALLENGE_REDIRECT;

export const THEME_SETTINGS = configGetter<IThemeSettings>('themeSettings', {
    monochromeBackground: false,
});

export const IS_PAY_SERVER = queryGetter<string>('pt', '') === 'payment-v3';
