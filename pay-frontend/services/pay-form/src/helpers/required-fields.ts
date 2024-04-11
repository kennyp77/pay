import pathOr from '@tinkoff/utils/object/pathOr';
import { InitPaymentSheet, RequiredBillingContactFields } from '@yandex-pay/sdk/src/typings';

export const getBillingRequiredFields = (
    sheet: InitPaymentSheet,
): RequiredBillingContactFields => ({
    email: pathOr(['requiredFields', 'billingContact', 'email'], false, sheet) as boolean,
    name: pathOr(['requiredFields', 'billingContact', 'name'], false, sheet) as boolean,
});
