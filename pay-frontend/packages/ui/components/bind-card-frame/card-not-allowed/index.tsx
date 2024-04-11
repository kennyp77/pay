import React from 'react';

import { CardSystem } from '@trust/utils/cards';
import { getReadableCardSystem } from '@yandex-pay/pay-form/src/helpers/user-card';
import { block } from 'bem-cn';

import Icon from '../../ui/icon';

import './styles.css';

const b = block('card-not-allowed');

interface CardNotAllowedProps {
    cardSystem?: CardSystem;
}

export default function CardNotAllowed({ cardSystem = CardSystem.Unknown }: CardNotAllowedProps): JSX.Element {
    const description =
        cardSystem === CardSystem.Unknown
            ? 'Магазин не принимает карты этой платёжной системы'
            : `Этот магазин не принимает карты ${getReadableCardSystem(cardSystem)}`;

    return (
        <div className={b()}>
            <Icon glyph="card-not-allowed" />
            <div className={b('description')}>{description}</div>
        </div>
    );
}
