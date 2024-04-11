/* eslint-disable quote-props */
import React, { SVGAttributes } from 'react';

import { block } from 'bem-cn';

import CardNotAllowedIcon from './assets/card-not-allowed.svg';
import ChevronIcon from './assets/chevron.svg';
import CloseIcon from './assets/close.svg';
import ConnectionInterruptedIcon from './assets/connection-interrupted.svg';
import ErrorIcon from './assets/error.svg';
import LockIcon from './assets/lock.svg';
import MethodCheckIcon from './assets/method-check.svg';
import PaymentErrorIcon from './assets/payment-error.svg';
import PaymentSuccessIcon from './assets/payment-success.svg';
import PlusGradientIcon from './assets/plus-gradient.svg';
import PlusReturnTextIcon from './assets/plus-return-text.svg';
import QuestionMarkIcon from './assets/question-mark.svg';
import YaPayLogoBrandIcon from './assets/ya-pay-logo-brand.svg';
import YaPayLogoWithAccentIcon from './assets/ya-pay-logo-with-accent.svg';
import YaPayLogoIcon from './assets/ya-pay-logo.svg';
import YandexLogoIcon from './assets/yandex-logo.svg';
import './styles.css';

const b = block('icon');

const ICONS_MAP = {
    'card-not-allowed': CardNotAllowedIcon,
    chevron: ChevronIcon,
    'connection-interrupted': ConnectionInterruptedIcon,
    lock: LockIcon,
    'method-check': MethodCheckIcon,
    'payment-error': PaymentErrorIcon,
    'payment-success': PaymentSuccessIcon,
    'ya-pay-logo': YaPayLogoIcon,
    'ya-pay-logo-with-accent': YaPayLogoWithAccentIcon,
    'ya-pay-logo-brand': YaPayLogoBrandIcon,
    'yandex-logo': YandexLogoIcon,
    'plus-gradient': PlusGradientIcon,
    'plus-return-text': PlusReturnTextIcon,
    'question-mark': QuestionMarkIcon,
    close: CloseIcon,
    error: ErrorIcon,
};

type IconGlyphs = keyof typeof ICONS_MAP;
interface IconProps extends SVGAttributes<SVGElement> {
    glyph: IconGlyphs;
}

export default function Icon({ className, glyph, ...props }: IconProps): JSX.Element {
    const icon = ICONS_MAP[glyph];

    if (!icon) {
        return null;
    }

    return (
        <svg
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className={b({ [glyph]: true })
                .mix(className)
                .toString()}
            viewBox={icon.viewBox}
            xmlns="http://www.w3.org/2000/svg"
        >
            <use xlinkHref={`#${icon.id}`} />
        </svg>
    );
}
