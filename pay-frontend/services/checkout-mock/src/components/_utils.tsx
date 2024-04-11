export { default as isEmpty } from '@tinkoff/utils/is/empty';
export { default as pathOr } from '@tinkoff/utils/object/pathOr';
import { PaymentSheet, RequiredBillingContactFields } from '@yandex-pay/sdk/src/typings';

export const isTrue = (val: any) => val === true;
export const isArray = (val: any) => Array.isArray(val);

export const requiredFields = (
    sheet: PaymentSheet,
): {
    billingContact: RequiredBillingContactFields;
    shippingContact: boolean;
    shippingMethod: boolean;
    shippingDirect: boolean;
    shippingPickup: boolean;
    comment: boolean;
} => {
    const { shippingTypes = {}, billingContact, shippingContact } = sheet.requiredFields || {};
    const { comment = false } = sheet.additionalFields || {};

    return {
        billingContact,
        shippingContact: Boolean(shippingContact),
        shippingMethod: shippingTypes.direct || shippingTypes.pickup,
        shippingDirect: shippingTypes.direct,
        shippingPickup: shippingTypes.pickup,
        comment,
    };
};
