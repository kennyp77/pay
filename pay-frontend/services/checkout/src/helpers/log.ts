import toArray from '@tinkoff/utils/array/toArray';
import toString from '@tinkoff/utils/string/toString';
import { logDebug, logError } from '@trust/rum';

export function logContacts(
    from: string,
    contacts: Checkout.Contact[],
    activeId?: string,
    activeContact?: Checkout.Contact,
) {
    try {
        const hideContactData = (contact: Checkout.Contact) => ({
            id: contact.id,
            firstName: toString(contact.firstName).length,
            lastName: toString(contact.lastName).length,
            secondName: toString(contact.secondName).length,
            email: toString(contact.email).length,
            phoneNumber: toString(contact.phoneNumber).length,
        });

        const list = toArray(contacts).map(hideContactData);
        const contact = activeContact ? hideContactData(activeContact) : null;

        const extra = {
            toJSON: () => ({ from, list, id: activeId, contact }),
        };

        logDebug('Checkout contacts', extra as any);
    } catch (err) {
        logError(err, { fn: 'logContacts' });
    }
}
