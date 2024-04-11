import { Experiment } from '@trust/utils/experiment';
import { createGetter } from '@trust/utils/object';
import {
    ButtonOptions,
    ButtonStyles,
    ButtonTheme,
    ButtonType,
    ButtonWidth,
    InitPaymentSheet,
} from '@yandex-pay/sdk/src/typings';

const configGetter = createGetter(window.__CONFIG);

const DEFAULT_BUTTON: ButtonOptions = {
    type: ButtonType.Simple,
    theme: ButtonTheme.Black,
    width: ButtonWidth.Auto,
};

const DEFAULT_BUTTON_STYLES: ButtonStyles = {
    border: 8,
    height: 54,
};

const DEFAULT_BUTTON_VIEW = {
    shortCashback: false,
    noPersonalized: false,
    monochromeLogo: false,
};

export const ENV = configGetter('env', 'production');
export const REQ_ID = configGetter('reqid', '0');

export const IS_AUTH = configGetter('isAuth') === true;
export const HAS_AVATAR = configGetter<boolean>('hasAvatar', false);
export const AVATAR_URL = configGetter<string>('avatarUrl');
export const CSRF_TOKEN = configGetter<string>('csrfToken', '');
export const PAYMENT_SHEET = configGetter<void | InitPaymentSheet>('paymentSheet');
export const BUTTON_OPTIONS = configGetter<ButtonOptions>('buttonOptions', DEFAULT_BUTTON);
export const BUTTON_STYLES = configGetter<ButtonStyles>('buttonStyles', DEFAULT_BUTTON_STYLES);
export const PARENT_ORIGIN = configGetter<string>('parentOrigin', '');
export const METRIKA_SESSION_ID = configGetter<string>('metrikaSessionId', 'no-sid');
export const EXPERIMENT = configGetter<Experiment>('experiment');
export const FRAME_URL_WHITELIST = configGetter<string[]>('frameUrlWhitelist', []);
export const BUTTON_VIEW = configGetter<typeof DEFAULT_BUTTON_VIEW>(
    'buttonView',
    DEFAULT_BUTTON_VIEW,
);

export const IS_SPLIT_AVAILABLE = configGetter<boolean>(['features', 'split'], false);
export const SPLIT_MERCHANT_WHITELIST = configGetter<string[]>(['split', 'merchantId'], []);
export const SPLIT_AVAILABLE_AMOUNT_RANGE = configGetter<number[]>(['split', 'amountRange'], []);
export const HIDE_PERSONAL_FLAG = configGetter<string[]>(
    ['features', 'testingFlags', 'hidePersonal'],
    [],
);
export const FALL_FLAG = configGetter<boolean>(['features', 'testingFlags', 'fall'], false);

export const DIMENSIONS = {
    minWidth: 282,
    minHeight: 40,
    defHeight: 54,
    maxHeight: 64,
};
