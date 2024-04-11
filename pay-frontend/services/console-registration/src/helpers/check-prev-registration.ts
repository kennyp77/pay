import { GetPartnersData } from '@trust/console-api';

export function isMerchantHaveRegistration({ partners }: GetPartnersData): boolean {
    if (partners) {
        return partners.some(({ registrationData }) => {
            const fieldsToCheck = { ...registrationData, contact: '' };

            return Object.values(fieldsToCheck).some((field) => Boolean(field));
        });
    }

    return false;
}
