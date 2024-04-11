import { block } from 'bem-cn';

import NetworkLogo from '../network-logo';

import './styles.css';

interface CardInfoProps {
    network: string;
    last4: string;
}

const b = block('card-info');

export default function CardInfo({ network = '', last4 }: CardInfoProps): string {
    return `
    <div class="${b()}">
      <div class="${b('network')}">
        ${NetworkLogo({ network })}
      </div>
      <div class="${b('pan')}">•••  ${last4}</div>
    </div>
  `;
}
