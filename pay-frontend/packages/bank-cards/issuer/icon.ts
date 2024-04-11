/* eslint-disable global-require */

import { CardIssuer } from '../typings';

const CardIssuerIcon = {
    [CardIssuer.AkBars]: require('./assets/ak-bars.svg'),
    [CardIssuer.Alfabank]: require('./assets/alfabank.svg'),
    [CardIssuer.Atb]: require('./assets/atb.svg'),
    [CardIssuer.Avangard]: require('./assets/avangard.svg'),
    [CardIssuer.Bankrossiya]: require('./assets/bankrossiya.svg'),
    [CardIssuer.Belarusbank]: require('./assets/belarusbank.svg'),
    [CardIssuer.Belinvest]: require('./assets/belinvest.svg'),
    [CardIssuer.Binbank]: require('./assets/binbank.svg'),
    [CardIssuer.Citibank]: require('./assets/citibank.svg'),
    [CardIssuer.CreditEurope]: require('./assets/credit-europe.svg'),
    [CardIssuer.Gazprombank]: require('./assets/gazprombank.svg'),
    [CardIssuer.HomeCredit]: require('./assets/home-credit.svg'),
    [CardIssuer.Kaspi]: require('./assets/kaspi.svg'),
    [CardIssuer.Levoberezhny]: require('./assets/levoberezhny.svg'),
    [CardIssuer.Minbank]: require('./assets/minbank.svg'),
    [CardIssuer.Mkb]: require('./assets/mkb.svg'),
    [CardIssuer.Modulbank]: require('./assets/modulbank.svg'),
    [CardIssuer.Mtbank]: require('./assets/mtbank.svg'),
    [CardIssuer.Mtsbank]: require('./assets/mtsbank.svg'),
    [CardIssuer.Novikombank]: require('./assets/novikombank.svg'),
    [CardIssuer.Orient]: require('./assets/orient.svg'),
    [CardIssuer.Otkritie]: require('./assets/otkritie.svg'),
    [CardIssuer.Otpbank]: require('./assets/otpbank.svg'),
    [CardIssuer.Pochtabank]: require('./assets/pochtabank.svg'),
    [CardIssuer.Priorbank]: require('./assets/priorbank.svg'),
    // TODO: Нет иконки
    [CardIssuer.Privatbank]: require('./assets/unknown.svg'),
    [CardIssuer.Psb]: require('./assets/psb.svg'),
    [CardIssuer.Qazkom]: require('./assets/qazkom.svg'),
    [CardIssuer.Qiwi]: require('./assets/qiwi.svg'),
    [CardIssuer.Raiffeisen]: require('./assets/raiffeisen.svg'),
    [CardIssuer.Renaissance]: require('./assets/renaissance.svg'),
    [CardIssuer.Rnkb]: require('./assets/rnkb.svg'),
    [CardIssuer.Rosbank]: require('./assets/rosbank.svg'),
    [CardIssuer.Rosselkhoz]: require('./assets/rosselkhoz.svg'),
    [CardIssuer.Roundbank]: require('./assets/roundbank.svg'),
    [CardIssuer.Russtandard]: require('./assets/russtandard.svg'),
    [CardIssuer.Sberbank]: require('./assets/sberbank.svg'),
    [CardIssuer.Skb]: require('./assets/skb.svg'),
    [CardIssuer.Sovcombank]: require('./assets/sovcombank.svg'),
    [CardIssuer.Spbbank]: require('./assets/spbbank.svg'),
    [CardIssuer.Swedbank]: require('./assets/swedbank.svg'),
    [CardIssuer.Tinkoff]: require('./assets/tinkoff.svg'),
    [CardIssuer.Ubrr]: require('./assets/ubrr.svg'),
    [CardIssuer.Unicredit]: require('./assets/unicredit.svg'),
    [CardIssuer.Uralsib]: require('./assets/uralsib.svg'),
    [CardIssuer.Vbrr]: require('./assets/vbrr.svg'),
    [CardIssuer.Vozrozhdenie]: require('./assets/vozrozhdenie.svg'),
    [CardIssuer.Vtb]: require('./assets/vtb.svg'),
    [CardIssuer.Yoomoney]: require('./assets/yoomoney.svg'),
    [CardIssuer.Unknown]: require('./assets/unknown.svg'),
};

type IconUrl = string;

export function getIconUrl(issuer: CardIssuer): IconUrl {
    return CardIssuerIcon[issuer] || CardIssuerIcon[CardIssuer.Unknown];
}
