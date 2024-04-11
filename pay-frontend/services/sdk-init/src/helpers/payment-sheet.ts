import flatten from '@tinkoff/utils/array/flatten';
import uniq from '@tinkoff/utils/array/uniq';
import pathOr from '@tinkoff/utils/object/pathOr';
import { PaymentSheet, AllowedAuthMethod, AllowedCardNetwork } from '@yandex-pay/sdk/src/typings';

export const getAllowedAuthMethods = (sheet: PaymentSheet): AllowedAuthMethod[] =>
    uniq(flatten(sheet.paymentMethods.map(pathOr(['allowedAuthMethods'], []))));

export const getAllowedCardNetworks = (sheet: PaymentSheet): AllowedCardNetwork[] =>
    uniq(flatten(sheet.paymentMethods.map(pathOr(['allowedCardNetworks'], []))));
