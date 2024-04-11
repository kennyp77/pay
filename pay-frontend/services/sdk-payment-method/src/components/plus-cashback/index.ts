import { formatThousands } from '@trust/utils/number-format';
import { PaymentCashback } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import { BUTTON_STYLES, BUTTON_VIEW, DIMENSIONS } from '../../config';
import { hasExp, getExpValue } from '../../helpers/experiment';
import { listenScaleChanges } from '../../helpers/scaler';
import SvgIcon from '../svg-icon';

import cashbackTextIcon from './assets/cashback-text.svg';
import plusLogoIcon from './assets/plus-logo.svg';
import returnTextIcon from './assets/return-text.svg';
import './styles.css';

const b = block('plus-cashback');

const CASHBACK_ID = 'cashback';

/* нужно добавлять отступ, если есть внешнее закругление у кнопки,
   иначе режется число */
export const getPlusOffset = (): number => {
    const { border, height } = BUTTON_STYLES;

    if (height / border < 2) {
        return Math.round(height * 0.3);
    }

    return Math.max(border / 2, 5); // 5px - default padding
};

function getPercentsFromCategory(category: string): string {
    const num = parseFloat(category) * 100;

    if (num > 0) {
        return num.toFixed(0);
    }

    return '';
}

export default function PlusCashback({ amount, percents, category }: PaymentCashback): string {
    const [formattedAmount] = formatThousands(Number(amount));
    const offset = getPlusOffset();

    // NB: поставлены размеры больше, чтобы начинать зумить при размерах больше чем минимум кнопки
    listenScaleChanges(
        CASHBACK_ID,
        DIMENSIONS.minWidth * 1.25,
        DIMENSIONS.minHeight * 1.15,
        function onResize(scale) {
            const element = document.getElementById(CASHBACK_ID);

            if (element && scale > 0) {
                element.style.setProperty('transform', `scale(${scale.toFixed(4)})`);
            }
        },
    );

    if (hasExp('cashback')) {
        let amount = getExpValue('cashback');
        const categoryPercents = getPercentsFromCategory(category);

        if (amount === 'category-percents' && categoryPercents) {
            amount = categoryPercents;
        }

        if (amount === 'amount-percents' && percents) {
            amount = percents;
        }

        if (!(Number(amount) > 0)) {
            amount = 'no-amount';
        }

        return `
        <div
          id="${CASHBACK_ID}"
          class="${b({ percent: true })}"
          style="padding-right: ${offset}px;"
        >
          <div class="${b('block')}">
            <div class="${b('text', { hidden: BUTTON_VIEW.shortCashback })}">
              ${SvgIcon(cashbackTextIcon)}
            </div>
            <div class="${b('amount', { hidden: amount === 'no-amount' })}">${amount}%</div>
            <div class="${b('logo')}">
              ${SvgIcon(plusLogoIcon)}
            </div>
          </div>
        </div>
      `;
    }

    return `
    <div id="${CASHBACK_ID}" class="${b()}" style="padding-right: ${offset}px;">
      <div class="${b('block')}">
        <div class="${b('text', { hidden: BUTTON_VIEW.shortCashback })}">
          ${SvgIcon(returnTextIcon)}
        </div>
        <div class="${b('logo')}">
          ${SvgIcon(plusLogoIcon)}
        </div>
        <div class="${b('amount')}">${formattedAmount}</div>
      </div>
    </div>
  `;
}
