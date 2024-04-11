import { SERVICE_OWNER_PASSPORT, SERVICE_OWNER_PAY } from '../config';

export const getReadableContact = (contact?: Checkout.Contact): string => {
    if (!contact) {
        return '';
    }

    return [contact.lastName, contact.firstName, contact.secondName || ''].join(' ');
};

export const isPayOwner = (contact?: Checkout.Contact): boolean => {
    return contact?.ownerService === SERVICE_OWNER_PAY;
};

export const isPassportOwner = (contact?: Checkout.Contact): boolean => {
    return contact?.ownerService === SERVICE_OWNER_PASSPORT;
};
