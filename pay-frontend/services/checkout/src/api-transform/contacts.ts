import { loadContacts, createContact } from '../api/pay-api';

type ApiContact = Sys.Return<typeof createContact>['data']['contact'];

function parseContact(contact: ApiContact): Checkout.Contact {
    return {
        id: contact.id,
        ownerService: contact.ownerService ?? '',
        firstName: contact.firstName ?? '',
        lastName: contact.lastName ?? '',
        secondName: contact.secondName ?? '',
        email: contact.email ?? '',
        phoneNumber: contact.phoneNumber ?? '',
    };
}

export function contactItem(res: Sys.Return<typeof createContact>): Checkout.Contact {
    return parseContact(res.data.contact);
}

export function contactsList(res: Sys.Return<typeof loadContacts>): Checkout.Contact[] {
    return res.data.results.map(parseContact);
}
