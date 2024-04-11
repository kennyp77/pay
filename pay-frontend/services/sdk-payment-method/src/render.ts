import { PaymentCashback, UserCard } from '@trust/utils/payment-methods/typings';
import { ButtonTheme } from '@yandex-pay/sdk/src/typings';

import App from './app';
import { BUTTON_OPTIONS } from './config';
import { formatXmlLikeString } from './helpers/format';
import { PayButtonType } from './typings';
// eslint-disable-next-line import/order
import './common.css';

const getBodyClass = (): string => {
    if (BUTTON_OPTIONS.theme === ButtonTheme.White) {
        return 'theme_white';
    }

    if (BUTTON_OPTIONS.theme === ButtonTheme.WhiteOutlined) {
        return 'theme_white-outlined';
    }

    if (BUTTON_OPTIONS.theme === ButtonTheme.Yellow) {
        return 'theme_yellow';
    }

    return 'theme_black';
};

const getRenderElement = (): HTMLElement => {
    const node = document.getElementById('root');

    if (!node) {
        throw new Error('Unable to found root node for render');
    }

    return node;
};

export const render = (
    button: PayButtonType,
    card?: UserCard,
    cashback?: PaymentCashback,
): void => {
    // render
    getRenderElement().innerHTML = formatXmlLikeString(App({ card, cashback, button }));

    // set body theme class
    document.body.classList.add(getBodyClass());
};
