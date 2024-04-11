import { block } from 'bem-cn';

import { CardNetwork } from '../../typings';

import networkMaestro from './assets/network-maestro.svg';
import networkMastercard from './assets/network-mastercard.svg';
import networkMir from './assets/network-mir.svg';
import networkVisa from './assets/network-visa.svg';
import './styles.css';

type SVGMeta = typeof networkMastercard;

interface NetworkLogoProps {
    network: string;
}

const NETWORK_LOGOS = {
    [CardNetwork.Maestro]: networkMaestro,
    [CardNetwork.Mastercard]: networkMastercard,
    [CardNetwork.Mir]: networkMir,
    [CardNetwork.Visa]: networkVisa,
};

const findNetworkLogo = (network: string): SVGMeta | null => {
    const networkInLowerCase = network.toLowerCase();
    const networkKey = Object.keys(NETWORK_LOGOS).find(
        (comparedNetwork) => networkInLowerCase === comparedNetwork.toLowerCase(),
    );

    if (networkKey) {
        return NETWORK_LOGOS[networkKey as CardNetwork];
    }

    return null;
};

const b = block('network-logo');

export default function NetworkLogo({ network }: NetworkLogoProps): string {
    const logo = findNetworkLogo(network);

    if (logo) {
        return `
      <svg
        class="${b()}"
        viewBox="${logo.viewBox}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <use
          xlink:href="#${logo.id}"
          href="#${logo.id}"
        />
      </svg>
    `;
    }

    return '';
}
