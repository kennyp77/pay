import { block } from 'bem-cn';

import yaPayLogo from './assets/yapay.svg';
import yaPayLogoMonochrome from './assets/yapay_monochrome.svg';
import './styles.css';

const b = block('yapay-logo');

export default function YaPayLogo(monochrome: boolean): string {
    const logoSvg = monochrome ? yaPayLogoMonochrome : yaPayLogo;

    return `
    <svg
      class="${b()}"
      viewBox="${logoSvg.viewBox}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use
        xlink:href="#${logoSvg.id}"
        href="#${logoSvg.id}"
      />
    </svg>
  `;
}
