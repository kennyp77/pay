import { count } from './utils';

export const splitAvailable = count('split_available');
export const toggleSplit = (value: boolean) => {
    return count('toggle_split')({ value: `${value ? 'on' : 'off'}-${Date.now()}` });
};
export const splitScoreError = count('split_score_error');
export const splitUnknownError = count('split_unknown_error');
export const splitPageShow = count('split_page_show');
export const splitPageHide = count('split_page_hide');
export const splitFrameSuccess = count('split_frame_success');
export const splitFrameError = count('split_frame_error');
export const splitPaymentSuccess = count('split_payment_success');
export const splitPaymentError = count('split_payment_error');
export const splitPaymentCancel = count('split_payment_cancel');
export const splitPaymentComplete = count('split_payment_complete');

export const splitDeactivate = count('split_deactivate');

export const newCardFormLoadingSplit = count('new_card_form_loading_split');
export const newCardBindingSplit = count('new_card_binding_split');
export const newCardCheckoutSplit = count('new_card_checkout_split');
