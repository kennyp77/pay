import { hasCashback } from '@trust/utils/payment-methods/cashback';
import { PaymentCashback, UserCard } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import { isButtonWithCard, isButtonWithUser, isButtonWithSplit } from '../../button-type';
import { AVATAR_URL, BUTTON_VIEW } from '../../config';
import { PayButtonType } from '../../typings';
import CardInfo from '../card-info';
import PayText from '../pay-text';
import UserAvatar from '../user-avatar';
import YaPayLogo from '../yapay-logo';

import './styles.css';

interface PaymentMethodProps {
    button: PayButtonType;
    card?: UserCard;
    cashback?: PaymentCashback;
}

const b = block('payment-method');

export default function PaymentMethod({ button, card, cashback }: PaymentMethodProps): string {
    const hasNoAvatar = !isButtonWithUser(button);
    const hasNoCard = !isButtonWithCard(button);
    const hasNoInfo = hasNoCard && hasNoAvatar;
    const hasSplit = isButtonWithSplit(button);

    const options = {
        'no-avatar': hasNoAvatar,
        'no-card': hasNoCard,
        'no-info': hasNoInfo,
        'with-cashback': hasCashback(cashback),
        'with-split': hasSplit,
    };

    return `
    <div class="${b(options)}">
      <div class="${b('inner')}">
        <div class="${b('logo')}">
          ${YaPayLogo(BUTTON_VIEW.monochromeLogo)}
        </div>
        <div class="${b('card')}">
          ${CardInfo({ network: card?.cardNetwork, last4: card?.last4 })}
        </div>
        <div class="${b('text')}">
          ${PayText(button)}
        </div>
        <div class="${b('user')}">
          ${UserAvatar({ avatar: AVATAR_URL })}
        </div>
      </div>
    </div>
  `;
}
