import _ from 'lodash';

import WebCore from './web-core';

export const PAYMENT_SHEET_STUB: any = {
    version: 2,
    countryCode: '',
    currencyCode: '',
    merchant: { id: '', name: '' },
    order: {
        id: '',
        items: [],
        total: { amount: '' },
    },
    paymentMethods: [],
};

export const CHECK_OPTIONS_STUB: any = {
    merchantId: '',
    paymentMethods: [],
};

export const getIsCheckout = (sheet: any) => {
    const requiredShippingContactFields = _.get(sheet, ['requiredFields', 'shippingContact']);
    const requiredShippingTypes = _.get(sheet, ['requiredFields', 'shippingTypes']);

    return Boolean(requiredShippingContactFields || requiredShippingTypes);
};

export const getButtonView = (sheet: any, core: WebCore) => {
    const merchantId = getMerchantId(sheet);

    return {
        shortCashback: core.config.shortCashbackViewMerchantId.includes(merchantId),
        noPersonalized: core.config.withoutPersonalizeMerchantId.includes(merchantId),
        monochromeLogo: core.config.monochromeLogoMerchantId.includes(merchantId),
    };
};

export const getMerchantId = (sheet: any) => {
    return _.get(sheet, ['merchant', 'id']);
};

export const getPaymentMethods = (sheet: any) => {
    return _.get(sheet, 'paymentMethods');
};

export const getOrderAmount = (sheet: any): string => {
    return _.get(sheet, ['order', 'total', 'amount'], '');
};
