import { hasCashback } from '@trust/utils/payment-methods/cashback';
import { PaymentCashback, UserCard } from '@trust/utils/payment-methods/typings';

import { isCheckoutButton } from './button-type';
import Block from './components/block';
import PayButton from './components/pay-button';
import PaymentMethod from './components/payment-method';
import PlusCashback from './components/plus-cashback';
import Tele2Cashback from './components/tele2-cashback';
import { DIMENSIONS } from './config';
import { hasExp } from './helpers/experiment';
import { PayButtonType } from './typings';

export interface AppProps {
    button: PayButtonType;
    card?: UserCard;
    cashback?: PaymentCashback;
}

export default function App({ button, card, cashback }: AppProps): string {
    let blockElement = Block(
        {
            id: 'app',
            minWidth: DIMENSIONS.minWidth,
            minHeight: DIMENSIONS.minHeight,
            maxHeight: DIMENSIONS.maxHeight,
        },
        PaymentMethod({ button, card, cashback }),
    );

    if (hasExp('new-button') && !isCheckoutButton(button)) {
        blockElement = PayButton({ button, card, cashback });
    }

    let plusElement = '';

    if (hasCashback(cashback)) {
        plusElement = cashback.category === 'tele2.ru' ? Tele2Cashback() : PlusCashback(cashback);
    }

    return `${blockElement}${plusElement}`;
}
