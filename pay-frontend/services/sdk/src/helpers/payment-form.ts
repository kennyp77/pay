import { SearchParams, getOrigin, setSearchParams } from '@trust/utils/url';

import { FORM_URL, CHECKOUT_FORM_URL, YM_UID } from '../config';
import { getParamsIds as getMetrikaParamsIds } from '../metrika';
import { InitPaymentSheet, PaymentEnv, PaymentType } from '../typings';

export function getBaseFormUrl(initSheet: InitPaymentSheet, type: PaymentType) {
    if (type === 'checkout' || type === 'checkout-v3') {
        return CHECKOUT_FORM_URL;
    }

    return FORM_URL;
}

export function getFormName(formName: string, initSheet: InitPaymentSheet): string {
    // TODO: Убрать после внедрения валидатора YANDEXPAY-1633
    const noOrder = { id: 'no-id' };

    return `${formName}-${(initSheet.order || noOrder).id}`;
}

export const getFormUrl = (
    baseUrl: string,
    initSheet?: void | InitPaymentSheet,
    params?: {
        checkoutCounter?: number;
        env?: PaymentEnv;
        type?: PaymentType;
        fromRedirect?: boolean;
    },
): string => {
    let formUrl = baseUrl;
    const searchParams: SearchParams = {};

    if (params?.fromRedirect) {
        searchParams.fromRedirect = '1';
    }

    if (params?.type) {
        searchParams.pt = params.type;
    }

    if (initSheet) {
        const metrikaParamsIds = getMetrikaParamsIds(initSheet, params?.checkoutCounter);

        searchParams.ymuid = YM_UID;
        searchParams.msid = metrikaParamsIds[0] || '';
        searchParams.mcid = metrikaParamsIds[1] || '';
    }

    if (params?.env === PaymentEnv.Sandbox) {
        formUrl = baseUrl.replace(/^https:\/\/pay\.yandex\./, 'https://sandbox.pay.yandex.');
    }

    return setSearchParams(formUrl, searchParams);
};

export function getFormOrigin(formUrl: string): string {
    return getOrigin(formUrl);
}

export const getWindowFeatures = (formSize: number[]): undefined | string => {
    const { screen } = window;
    const [width, height] = formSize;

    // NB: Если экран маленький, то не отдаем параметры
    if (screen.width < width || screen.height < height) {
        return undefined;
    }

    // TODO: Центрировать не по экрану, а по открытому браузеру
    const left = (screen.width - width) >> 1;
    const top = (screen.height - height) >> 1;

    return [
        'scrollbars=yes',
        'resizable=yes',
        'status=no',
        'location=no',
        'toolbar=no',
        'menubar=no',
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
    ].join(',');
};
