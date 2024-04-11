import { block } from 'bem-cn';

import { BUTTON_STYLES } from '../../config';
import { getPlusOffset } from '../plus-cashback';
import SvgIcon from '../svg-icon';

import giftTextIcon from './assets/gift-text.svg';
import './styles.css';

const b = block('tele2-cashback');

export default function Tele2Cashback(): string {
    const offset = getPlusOffset();
    const styles = [
        `padding-right: ${offset}px;`,
        `padding-left: ${Math.round(offset * 0.7)}px;`,
        `border-bottom-left-radius: ${BUTTON_STYLES.border || 8}px;`,
    ].join('');

    return `
    <div class="${b()}" style="${styles}">
      <div class="${b('gift-text')}">
        ${SvgIcon(giftTextIcon)}
      </div>
    </div>
  `;
}
