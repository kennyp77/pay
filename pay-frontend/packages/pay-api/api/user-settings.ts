import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

interface UserSettings {
    userSettings: {
        cardId: string;
        addressId: string;
        contactId: string;
        isCheckoutOnboarded: boolean;
    };
}

type UserSettingsFormData = Partial<UserSettings['userSettings']>;

export async function loadUserSettings(): Promise<ApiResponseSuccess<UserSettings>> {
    const url = '/api/v1/user_settings';

    return send.get(url);
}

export async function updateUserSettings(
    userSettings: Partial<UserSettingsFormData>,
): Promise<ApiResponseSuccess<UserSettings>> {
    const url = '/api/v1/user_settings';

    return send.put(url, userSettings);
}
