import { block } from 'bem-cn';

import './styles.css';

interface Svg {
    id: string;
    viewBox: string;
}

const b = block('svg-icon');

export default function SvgIcon(svg: Svg, className?: string): string {
    return `
    <svg
      class="${b([className])}"
      viewBox="${svg.viewBox}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use
        xlink:href="#${svg.id}"
        href="#${svg.id}"
      />
    </svg>
  `;
}
