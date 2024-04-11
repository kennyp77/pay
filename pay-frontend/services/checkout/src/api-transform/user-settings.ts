import { loadUserSettings } from '../api/pay-api';
import { getEmptyUserState } from '../helpers/user-state';

const initialUserState = getEmptyUserState();

export function userState(res: Sys.Return<typeof loadUserSettings>): Checkout.UserState {
    const { userSettings } = res.data;

    return {
        cardId: userSettings.cardId ?? initialUserState.cardId,
        contactId: userSettings.contactId ?? initialUserState.contactId,
        addressId: userSettings.addressId ?? initialUserState.addressId,
        isCheckoutOnboarded:
            userSettings.isCheckoutOnboarded ?? initialUserState.isCheckoutOnboarded,
    };
}
