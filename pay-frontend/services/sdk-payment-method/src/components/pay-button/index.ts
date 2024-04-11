import { PaymentCashback, UserCard } from '@trust/utils/payment-methods/typings';
import { block } from 'bem-cn';

import { isButtonWithCard, isButtonWithUser } from '../../button-type';
import { AVATAR_URL, DIMENSIONS } from '../../config';
import { hasExp } from '../../helpers/experiment';
import { listenScaleChanges } from '../../helpers/scaler';
import { PayButtonType } from '../../typings';
import CardInfo from '../card-info-small';
import PayText from '../pay-text';
import UserAvatar from '../user-avatar';

import './styles.css';

interface PaymentMethodProps {
    button: PayButtonType;
    card?: UserCard;
    cashback?: PaymentCashback;
}

const b = block('pay-button');

export default function PayButton({ button, card }: PaymentMethodProps): string {
    const hasNoAvatar = !isButtonWithUser(button);
    const hasNoCard = !isButtonWithCard(button);

    const options = {
        'no-user': hasNoAvatar,
        'no-card': hasNoCard,
    };

    // Показываем пустыне данные, только если они не отсутсвуют полностью (и карта и ава)
    if (hasExp('new-button--show-empty') && !(hasNoAvatar && hasNoCard)) {
        delete options['no-user'];
        delete options['no-card'];
    }

    listenScaleChanges('pay-button', 1, DIMENSIONS.defHeight, function onResize(scale) {
        const user = document.getElementById('btn-user');
        const text = document.getElementById('btn-text');
        const card = document.getElementById('btn-card');

        if (user && text && card && 0 < scale && scale < 1) {
            const userScale = 0.6 + (1 - scale) * 0.5;
            const textScale = scale + (1 - scale) * 0.5;

            user.style.setProperty('transform', `scale(${userScale.toFixed(4)})`);
            text.style.setProperty('transform', `scale(${textScale.toFixed(4)})`);
            card.style.setProperty('transform', `scale(${textScale.toFixed(4)})`);
        }
    });

    return `
    <div class="${b(options)}">
        <div class="${b('card')}">
          <div id="btn-card" class="${b('card-inner')}">
            ${CardInfo({ card })}
          </div>
        </div>
        <div class="${b('text')}">
          <div id="btn-text" class="${b('text-inner', {
              'text-logo': hasExp('new-button--logo-as-text'),
          })}">
            ${PayText(PayButtonType.Pay)}
          </div>
        </div>
        <div class="${b('user')}">
          <div id="btn-user" class="${b('user-inner')}">
            ${UserAvatar({ avatar: AVATAR_URL, empty: hasNoAvatar, payButton: true })}
          </div>
        </div>
    </div>
  `;
}
