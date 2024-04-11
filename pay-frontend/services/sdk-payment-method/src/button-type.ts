import { ButtonType } from '@yandex-pay/sdk/src/typings';

import { BUTTON_OPTIONS, BUTTON_VIEW, HAS_AVATAR, ENV, HIDE_PERSONAL_FLAG } from './config';
import { PayButtonType } from './typings';

export function getButtonType({
    hasCard,
    hasSplit,
}: {
    hasCard: boolean;
    hasSplit: boolean;
}): PayButtonType {
    let noInfo = BUTTON_VIEW.noPersonalized;
    let hasAvatar = HAS_AVATAR;
    const buttonType = BUTTON_OPTIONS.type;

    const isCheckout = buttonType === ButtonType.Checkout;
    const isPay = buttonType === ButtonType.Pay;

    if (ENV !== 'production') {
        if (HIDE_PERSONAL_FLAG.includes('CARD')) {
            hasCard = false;
        }
        if (HIDE_PERSONAL_FLAG.includes('AVATAR')) {
            hasAvatar = false;
        }
    }

    if (noInfo) {
        if (isPay) {
            return PayButtonType.Pay;
        }

        return PayButtonType.Simple;
    }

    if (isCheckout) {
        if (hasSplit && hasAvatar) {
            return PayButtonType.CheckoutSplitUser;
        }

        if (hasSplit) {
            return PayButtonType.CheckoutSplit;
        }

        if (hasAvatar) {
            return PayButtonType.CheckoutUser;
        }

        return PayButtonType.Checkout;
    }

    if (hasAvatar && hasCard) {
        return PayButtonType.PayUserCard;
    }

    if (hasCard) {
        return PayButtonType.PayCard;
    }

    if (hasAvatar) {
        return PayButtonType.PayUser;
    }

    if (isPay) {
        return PayButtonType.Pay;
    }

    return PayButtonType.Simple;
}

export function isCheckoutButton(buttonType: PayButtonType): boolean {
    return [
        PayButtonType.CheckoutSplitUser,
        PayButtonType.CheckoutSplit,
        PayButtonType.CheckoutUser,
        PayButtonType.Checkout,
    ].includes(buttonType);
}

export function isButtonWithCard(buttonType: PayButtonType): boolean {
    return [PayButtonType.PayCard, PayButtonType.PayUserCard].includes(buttonType);
}

export function isButtonWithUser(buttonType: PayButtonType): boolean {
    return [
        PayButtonType.PayUser,
        PayButtonType.PayUserCard,
        PayButtonType.CheckoutUser,
        PayButtonType.CheckoutSplitUser,
    ].includes(buttonType);
}

export function isButtonWithSplit(buttonType: PayButtonType): boolean {
    return [PayButtonType.CheckoutSplit, PayButtonType.CheckoutSplitUser].includes(buttonType);
}
