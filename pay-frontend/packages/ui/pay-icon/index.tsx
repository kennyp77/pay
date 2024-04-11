/* eslint-disable quote-props */
import React from 'react';

import { CardSystem } from '@trust/utils/cards';
import { block } from 'bem-cn';

import CardAmericanExpressIcon from './assets/card/american-express.svg';
import CardApplePayIcon from './assets/card/apple-pay.svg';
import CardDiscoverIcon from './assets/card/discover.svg';
import CardGooglePayIcon from './assets/card/google-pay.svg';
import CardJcbIcon from './assets/card/jcb.svg';
import CardMaestroIcon from './assets/card/maestro.svg';
import CardMastercardEliteIcon from './assets/card/mastercard-elite.svg';
import CardMastercardIcon from './assets/card/mastercard.svg';
import CardMirIcon from './assets/card/mir.svg';
import CardNewIcon from './assets/card/new-card.svg';
import CardUnionpayIcon from './assets/card/unionpay.svg';
import CardUnknownIcon from './assets/card/unknown.svg';
import CardUzcardIcon from './assets/card/uzcard.svg';
import CardVisaElectronIcon from './assets/card/visa-electron.svg';
import CardVisaIcon from './assets/card/visa.svg';
import './styles.css';

const b = block('pay-icon');

const PAY_METHODS_ICONS = {
    'apple-pay': CardApplePayIcon,
    'google-pay': CardGooglePayIcon,
    'new-card': CardNewIcon,
};

const PAY_SYSTEM_ICONS = {
    [CardSystem.AmericanExpress]: CardAmericanExpressIcon,
    [CardSystem.Discover]: CardDiscoverIcon,
    [CardSystem.JCB]: CardJcbIcon,
    [CardSystem.Maestro]: CardMaestroIcon,
    [CardSystem.Mastercard]: CardMastercardIcon,
    [CardSystem.MastercardElite]: CardMastercardEliteIcon,
    [CardSystem.Mir]: CardMirIcon,
    [CardSystem.UnionPay]: CardUnionpayIcon,
    [CardSystem.Unknown]: CardUnknownIcon,
    [CardSystem.Uzcard]: CardUzcardIcon,
    [CardSystem.Visa]: CardVisaIcon,
    [CardSystem.VisaElectron]: CardVisaElectronIcon,
};

const ALIGN_X_MAP = {
    left: 'xMinYMid meet',
    right: 'xMaxYMid meet',
};

interface BaseIconProps {
    className?: string;
    alignX?: 'left' | 'right';
}

type PayIconProps = BaseIconProps & {
    glyph: string;
    type: string;
    icon: any;
};

function PayIcon({ className, type, icon, glyph, alignX }: PayIconProps): JSX.Element {
    const props: Record<string, string> = {};

    if (!icon) {
        return null;
    }

    if (alignX && ALIGN_X_MAP[alignX]) {
        props.preserveAspectRatio = ALIGN_X_MAP[alignX];
    }

    const iconClass = b({ [type]: true, [glyph]: true })
        .mix(className)
        .toString();

    return (
        <svg
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className={iconClass}
            viewBox={icon.viewBox}
            xmlns="http://www.w3.org/2000/svg"
        >
            <use xlinkHref={`#${icon.id}`} />
        </svg>
    );
}

type PaySystemIconProps = BaseIconProps & { glyph: CardSystem };

export function PaySystemIcon(props: PaySystemIconProps): JSX.Element {
    return PayIcon({
        ...props,
        type: 'system',
        icon: PAY_SYSTEM_ICONS[props.glyph],
    });
}

type PayMethodsIconProps = BaseIconProps & {
    glyph: keyof typeof PAY_METHODS_ICONS;
};

export function PayMethodsIcon(props: PayMethodsIconProps): JSX.Element {
    return PayIcon({
        ...props,
        type: 'method',
        icon: PAY_METHODS_ICONS[props.glyph],
    });
}
