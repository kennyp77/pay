import always from '@tinkoff/utils/function/always';
import compose from '@tinkoff/utils/function/compose';
import cond from '@tinkoff/utils/function/cond';
import T from '@tinkoff/utils/function/T';
import toLower from '@tinkoff/utils/string/toLower';
import toString from '@tinkoff/utils/string/toString';

import { contain } from '../string';

export enum CardSystem {
    AmericanExpress = 'AmericanExpress',
    Discover = 'Discover',
    JCB = 'JCB',
    Maestro = 'Maestro',
    Mastercard = 'Mastercard',
    MastercardElite = 'MastercardElite',
    Mir = 'MIR',
    UnionPay = 'UnionPay',
    Unknown = 'Unknown',
    Uzcard = 'Uzcard',
    Visa = 'Visa',
    VisaElectron = 'VisaElectron',
}

const removeSpaces = (str: string): string => str.replace(/[^a-zA-Z]/g, '');

export const getCardSystem = compose<string | undefined, string, CardSystem>(
    cond([
        [contain('americanexpress', true), always(CardSystem.AmericanExpress)],
        [contain('discover', true), always(CardSystem.Discover)],
        [contain('jcb', true), always(CardSystem.JCB)],
        [contain('maestro', true), always(CardSystem.Maestro)],
        [contain('mastercard', true), always(CardSystem.Mastercard)],
        [contain('mastercardelite', true), always(CardSystem.MastercardElite)],
        [contain('mir', true), always(CardSystem.Mir)],
        [contain('unionpay', true), always(CardSystem.UnionPay)],
        [contain('uzcard', true), always(CardSystem.Uzcard)],
        [contain('visa', true), always(CardSystem.Visa)],
        [contain('visaelectron', true), always(CardSystem.VisaElectron)],
        [T, always(CardSystem.Unknown)],
    ]),
    compose(removeSpaces, toLower, toString),
);

const CardSystemNames: Record<string, string> = {
    [CardSystem.AmericanExpress]: 'American Express',
    [CardSystem.MastercardElite]: 'Mastercard Elite',
    [CardSystem.Visa]: 'VISA',
    [CardSystem.VisaElectron]: 'VISA Electron',
};

export const getCardSystemName = (system: CardSystem): string => {
    return CardSystemNames[system] || system;
};
