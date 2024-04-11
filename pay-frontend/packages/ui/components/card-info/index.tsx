// TODO i18n
import React from 'react';

import { CardIssuer, getPanMask } from '@trust/bank-cards/issuer';
import { getIconUrl } from '@trust/bank-cards/issuer/icon';
import { PaySystemIcon } from '@trust/ui/pay-icon';
import { getCardSystemName } from '@trust/utils/cards';
import { CardPaymentMethod } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import './styles.css';

const b = block('card-info');

interface CardInfoProps {
    card: CardPaymentMethod;
}

export default function CardInfo({ card }: CardInfoProps): JSX.Element {
    const isUnknownCard = card.issuer === CardIssuer.Unknown;

    // TODO i18n
    return (
        <div className={b()}>
            <span className={b('issuer')}>
                {isUnknownCard ? (
                    <span className={b('system-name')}>{getCardSystemName(card.system)}</span>
                ) : (
                    <span className={b('bank-logo')} style={{ backgroundImage: `url(${getIconUrl(card.issuer)})` }} />
                )}
            </span>
            <div className={b('meta')}>
                <span className={b('number-mask')}>{getPanMask()}</span>
                <span className={b('number')}>{card.lastDigits}</span>
                <span className={b('system')}>
                    <PaySystemIcon glyph={card.system} className={b('system-icon')} alignX="right" />
                </span>
            </div>
        </div>
    );
}
