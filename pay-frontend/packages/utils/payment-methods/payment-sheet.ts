import flatten from '@tinkoff/utils/array/flatten';
import uniq from '@tinkoff/utils/array/uniq';
import pathOr from '@tinkoff/utils/object/pathOr';
import {
    InitPaymentSheet,
    AllowedAuthMethod,
    AllowedCardNetwork,
} from '@yandex-pay/sdk/src/typings';

export const getAllowedAuthMethods = (sheet: InitPaymentSheet): AllowedAuthMethod[] =>
    uniq(flatten(pathOr(['paymentMethods'], [], sheet).map(pathOr(['allowedAuthMethods'], []))));

export const getAllowedCardNetworks = (sheet: InitPaymentSheet): AllowedCardNetwork[] =>
    uniq(flatten(pathOr(['paymentMethods'], [], sheet).map(pathOr(['allowedCardNetworks'], []))));
