import { isAndroidWebView } from '../helpers/platform';
import { getSearchParams, setSearchParams } from '../url';

import { QUERY_KEY } from './constants';
import { WindowParams } from './types';

export const getTop = (): Window => {
    return window.top;
};

export const getOpener = (): Window | null => {
    /* В Android webview есть доступ к родительскому окну
     * которого быть не может, и мы получаем багу
     * https://st.yandex-team.ru/YANDEXPAY-1488#60d4aaf37368386c0704edcd
     */
    return isAndroidWebView(navigator.userAgent) ? null : getTop().opener;
};

export const openWindow = (url: string, params: WindowParams = {}): Window | null => {
    return window.open(url, params.target, params.features);
};

export const getDataFromUrl = (url: string): string => {
    const params = getSearchParams(url);

    return params[QUERY_KEY] || '';
};

export const setDataToUrl = (url: string, data: string): string => {
    return setSearchParams(url, {
        [QUERY_KEY]: data,
    });
};

export const removeDataFromUrl = (url: string): string => {
    return setSearchParams(url, {
        [QUERY_KEY]: undefined,
    });
};
