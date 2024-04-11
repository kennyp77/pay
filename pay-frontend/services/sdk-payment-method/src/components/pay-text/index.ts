import { block } from 'bem-cn';

import { hasExp } from '../../helpers/experiment';
import { PayButtonType } from '../../typings';

import checkoutTextWithSplitIcon from './assets/checkout-text-with-split.svg';
import checkoutTextIcon from './assets/checkout-text.svg';
import checkoutIcon from './assets/checkout.svg';
import payTextWithYaIcon from './assets/pay-text-with-ya.svg';
import payTextIcon from './assets/pay-text.svg';
import payIcon from './assets/pay.svg';
import simpleIcon from './assets/simple.svg';
import './styles.css';

const b = block('pay-text');

const PAY_TEXT_ICONS = {
    [PayButtonType.Simple]: simpleIcon,
    [PayButtonType.Pay]: payIcon,
    [PayButtonType.PayUser]: payTextIcon,
    [PayButtonType.Checkout]: checkoutIcon,
    [PayButtonType.CheckoutUser]: checkoutTextIcon,
    [PayButtonType.CheckoutSplit]: checkoutTextWithSplitIcon,
    [PayButtonType.CheckoutSplitUser]: checkoutTextWithSplitIcon,
};

const getViewBox = (viewBox: string): string => {
    const parts = viewBox.split(' ');

    parts[3] = '32'; // выравнивание по высоте

    return parts.join(' ');
};

export default function PayText(buttonType: PayButtonType): string {
    // @ts-ignore
    let payTextIcon = PAY_TEXT_ICONS[buttonType];

    if (!payTextIcon) {
        return '';
    }

    if (buttonType === PayButtonType.Pay && hasExp('new-button--logo-as-text')) {
        payTextIcon = payTextWithYaIcon;
    }

    return `
    <svg
      class="${b()}"
      viewBox="${getViewBox(payTextIcon.viewBox)}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use
        xlink:href="#${payTextIcon.id}"
        href="#${payTextIcon.id}"
      />
    </svg>
  `;
}
