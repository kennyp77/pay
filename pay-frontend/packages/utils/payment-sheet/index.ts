import path from '@tinkoff/utils/object/path';
import pathOr from '@tinkoff/utils/object/pathOr';
import {
    AdditionalFields,
    InitPaymentSheet,
    PaymentMethodType,
    RequiredBillingContactFields,
    RequiredShippingContactFields,
    RequiredShippingTypes,
} from '@yandex-pay/sdk/src/typings';

export function getOrderAmount(sheet: any): string {
    return pathOr(['order', 'total', 'amount'], '', sheet);
}

export function getMerchantUrl(sheet: any): string {
    return pathOr(['merchant', 'url'], '', sheet);
}

export function getMerchantId(sheet: any): string {
    return pathOr(['merchant', 'id'], '', sheet);
}

export function getRequiredShippingTypes(sheet: InitPaymentSheet): RequiredShippingTypes | void {
    const fields = path(['requiredFields', 'shippingTypes'], sheet);

    if (fields) {
        return {
            direct: pathOr(['direct'], false, fields),
            pickup: pathOr(['pickup'], false, fields),
        };
    }
}

export function getRequiredBillingFields(
    sheet: InitPaymentSheet,
): RequiredBillingContactFields | void {
    const fields = path(['requiredFields', 'billingContact'], sheet);

    if (fields) {
        return {
            email: pathOr(['email'], false, fields),
        };
    }
}

export function getRequiredShippingContactFields(
    sheet: InitPaymentSheet,
): RequiredShippingContactFields | void {
    const fields = path(['requiredFields', 'shippingContact'], sheet);

    if (fields) {
        return {
            name: pathOr(['name'], true, fields),
            email: pathOr(['email'], true, fields),
            phone: pathOr(['phone'], false, fields),
        };
    }
}

export function getAdditionalFields(sheet: InitPaymentSheet): AdditionalFields | void {
    const fields = path(['additionalFields'], sheet);

    if (fields) {
        return {
            coupons: pathOr(['coupons'], false, fields),
            comment: pathOr(['comment'], false, fields),
        };
    }
}

export function hasCashPaymentMethod(sheet: InitPaymentSheet): boolean {
    const paymentMethods = pathOr(['paymentMethods'], [], sheet);

    return paymentMethods
        ? paymentMethods.some((method) => method.type === PaymentMethodType.Cash)
        : false;
}

export function hasPaymentMethodVerification(sheet: InitPaymentSheet): boolean {
    const paymentMethods = pathOr(['paymentMethods'], [], sheet);

    return paymentMethods
        ? paymentMethods.some(
              (method) => method.type === PaymentMethodType.Card && method.verificationDetails,
          )
        : false;
}

export function isCheckout(sheet: InitPaymentSheet) {
    return Boolean(getRequiredShippingContactFields(sheet) || getRequiredShippingTypes(sheet));
}

export function hasSplit(sheet: InitPaymentSheet) {
    const paymentMethods = pathOr(['paymentMethods'], [], sheet);

    return paymentMethods
        ? paymentMethods.some((method) => method.type === PaymentMethodType.Split)
        : false;
}
