import React from 'react';

import { CardIssuer } from '@trust/bank-cards/typings';

import { CASH_KEY, NEW_CARD_KEY } from '../../helpers/payment-method';
import { Icon, IconSize } from '../icons';

// Bank cards
import AkBarsIcon from './assets/ak-bars.svg';
import AlfabankIcon from './assets/alfabank.svg';
import AtbIcon from './assets/atb.svg';
import AvangardIcon from './assets/avangard.svg';
import BankrossiyaIcon from './assets/bankrossiya.svg';
import BelarusbankIcon from './assets/belarusbank.svg';
import BelinvestIcon from './assets/belinvest.svg';
import BinbankIcon from './assets/binbank.svg';
import CitibankIcon from './assets/citibank.svg';
import CreditEuropeIcon from './assets/credit-europe.svg';
import GazprombankIcon from './assets/gazprombank.svg';
import HomeCreditIcon from './assets/home-credit.svg';
import KaspiIcon from './assets/kaspi.svg';
import LevoberezhnyIcon from './assets/levoberezhny.svg';
import MinbankIcon from './assets/minbank.svg';
import MkbIcon from './assets/mkb.svg';
import ModulbankIcon from './assets/modulbank.svg';
import MtbankIcon from './assets/mtbank.svg';
import MtsbankIcon from './assets/mtsbank.svg';
import NovikombankIcon from './assets/novikombank.svg';
import OrientIcon from './assets/orient.svg';
import OtkritieIcon from './assets/otkritie.svg';
import OtpbankIcon from './assets/otpbank.svg';
import CashIcon from './assets/payment/cash.svg';
import NewCardIcon from './assets/payment/new-card.svg';
import PochtabankIcon from './assets/pochtabank.svg';
import PriorbankIcon from './assets/priorbank.svg';
import PsbIcon from './assets/psb.svg';
import QazkomIcon from './assets/qazkom.svg';
import QiwiIcon from './assets/qiwi.svg';
import RaiffeisenIcon from './assets/raiffeisen.svg';
import RenaissanceIcon from './assets/renaissance.svg';
import RnkbIcon from './assets/rnkb.svg';
import RosbankIcon from './assets/rosbank.svg';
import RosselkhozIcon from './assets/rosselkhoz.svg';
import RoundbankIcon from './assets/roundbank.svg';
import RusstandardIcon from './assets/russtandard.svg';
import SberbankIcon from './assets/sberbank.svg';
import SkbIcon from './assets/skb.svg';
import SovcombankIcon from './assets/sovcombank.svg';
import SpbbankIcon from './assets/spbbank.svg';
import SwedbankIcon from './assets/swedbank.svg';
import TinkoffIcon from './assets/tinkoff.svg';
import UbrrIcon from './assets/ubrr.svg';
import UnicreditIcon from './assets/unicredit.svg';
import PrivatbankIcon from './assets/unknown.svg';
import UnknownIcon from './assets/unknown.svg';
import UralsibIcon from './assets/uralsib.svg';
import VbrrIcon from './assets/vbrr.svg';
import VozrozhdenieIcon from './assets/vozrozhdenie.svg';
import VtbIcon from './assets/vtb.svg';
import YoomoneyIcon from './assets/yoomoney.svg';

const CardIssuerIcon = {
    [CardIssuer.AkBars]: AkBarsIcon,
    [CardIssuer.Alfabank]: AlfabankIcon,
    [CardIssuer.Atb]: AtbIcon,
    [CardIssuer.Avangard]: AvangardIcon,
    [CardIssuer.Bankrossiya]: BankrossiyaIcon,
    [CardIssuer.Belarusbank]: BelarusbankIcon,
    [CardIssuer.Belinvest]: BelinvestIcon,
    [CardIssuer.Binbank]: BinbankIcon,
    [CardIssuer.Citibank]: CitibankIcon,
    [CardIssuer.CreditEurope]: CreditEuropeIcon,
    [CardIssuer.Gazprombank]: GazprombankIcon,
    [CardIssuer.HomeCredit]: HomeCreditIcon,
    [CardIssuer.Kaspi]: KaspiIcon,
    [CardIssuer.Levoberezhny]: LevoberezhnyIcon,
    [CardIssuer.Minbank]: MinbankIcon,
    [CardIssuer.Mkb]: MkbIcon,
    [CardIssuer.Modulbank]: ModulbankIcon,
    [CardIssuer.Mtbank]: MtbankIcon,
    [CardIssuer.Mtsbank]: MtsbankIcon,
    [CardIssuer.Novikombank]: NovikombankIcon,
    [CardIssuer.Orient]: OrientIcon,
    [CardIssuer.Otkritie]: OtkritieIcon,
    [CardIssuer.Otpbank]: OtpbankIcon,
    [CardIssuer.Pochtabank]: PochtabankIcon,
    [CardIssuer.Priorbank]: PriorbankIcon,
    // TODO: Нет иконки
    [CardIssuer.Privatbank]: PrivatbankIcon,
    [CardIssuer.Psb]: PsbIcon,
    [CardIssuer.Qazkom]: QazkomIcon,
    [CardIssuer.Qiwi]: QiwiIcon,
    [CardIssuer.Raiffeisen]: RaiffeisenIcon,
    [CardIssuer.Renaissance]: RenaissanceIcon,
    [CardIssuer.Rnkb]: RnkbIcon,
    [CardIssuer.Rosbank]: RosbankIcon,
    [CardIssuer.Rosselkhoz]: RosselkhozIcon,
    [CardIssuer.Roundbank]: RoundbankIcon,
    [CardIssuer.Russtandard]: RusstandardIcon,
    [CardIssuer.Sberbank]: SberbankIcon,
    [CardIssuer.Skb]: SkbIcon,
    [CardIssuer.Sovcombank]: SovcombankIcon,
    [CardIssuer.Spbbank]: SpbbankIcon,
    [CardIssuer.Swedbank]: SwedbankIcon,
    [CardIssuer.Tinkoff]: TinkoffIcon,
    [CardIssuer.Ubrr]: UbrrIcon,
    [CardIssuer.Unicredit]: UnicreditIcon,
    [CardIssuer.Uralsib]: UralsibIcon,
    [CardIssuer.Vbrr]: VbrrIcon,
    [CardIssuer.Vozrozhdenie]: VozrozhdenieIcon,
    [CardIssuer.Vtb]: VtbIcon,
    [CardIssuer.Yoomoney]: YoomoneyIcon,
    [CardIssuer.Unknown]: UnknownIcon,
};

const PaymentIcon = {
    [CASH_KEY]: CashIcon,
    [NEW_CARD_KEY]: NewCardIcon,
};

export type PaymentType = typeof CASH_KEY | typeof NEW_CARD_KEY;

interface BankCardIconProps {
    issuer: CardIssuer;
    size?: IconSize;
}

interface PaymentOrCardIconProps {
    typeOrIssuer: CardIssuer | PaymentType;
    size?: IconSize;
}

export const BankCardRawIcon = (issuer: CardIssuer) => {
    return CardIssuerIcon[issuer] || CardIssuerIcon[CardIssuer.Unknown];
};

export const BankCardIcon = ({ issuer, size = 'l' }: BankCardIconProps) => {
    return <Icon svg={BankCardRawIcon(issuer)} size={size} />;
};

export const PaymentOrCardRawIcon = (typeOrIssuer: CardIssuer | PaymentType) => {
    if (typeOrIssuer === CASH_KEY || typeOrIssuer === NEW_CARD_KEY) {
        return PaymentIcon[typeOrIssuer];
    }

    return CardIssuerIcon[typeOrIssuer] || CardIssuerIcon[CardIssuer.Unknown];
};

export const PaymentOrCardIcon = ({ typeOrIssuer, size = 'l' }: PaymentOrCardIconProps) => {
    return <Icon svg={PaymentOrCardRawIcon(typeOrIssuer)} size={size} />;
};
