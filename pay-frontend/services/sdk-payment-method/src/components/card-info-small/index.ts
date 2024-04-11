import { UserCard } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import NetworkLogo from '../network-logo';
import SvgIcon from '../svg-icon';

import newCardIcon from './assets/new-card.svg';
import './styles.css';

interface CardInfoProps {
    card?: UserCard;
}

const b = block('card-info-small');

export default function CardInfo({ card }: CardInfoProps): string {
    const network = card?.cardNetwork;
    const last4 = card?.last4;

    if (!network || !last4) {
        return `
        <div class="${b()}">
          <div class="${b('new-card')}">
            ${SvgIcon(newCardIcon)}
            </svg>
          </div>
        </div>
      `;
    }

    return `
    <div class="${b()}">
      <div class="${b('network')}">
        ${NetworkLogo({ network })}
      </div>
      <div class="${b('pan')}">${last4}</div>
    </div>
  `;
}
