import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

type ContactId = string;

interface Contact {
    id: ContactId;
    ownerService: string;
    firstName: null | string;
    secondName: null | string;
    lastName: null | string;
    email: null | string;
    phoneNumber: null | string;
}

type ContactFormData = Omit<Contact, 'id' | 'ownerService'>;

export async function loadContacts(): Promise<ApiResponseSuccess<{ results: Contact[] }>> {
    const url = '/api/v1/contacts';

    return send.get(url);
}

export async function createContact(
    contact: ContactFormData,
): Promise<ApiResponseSuccess<{ contact: Contact }>> {
    const url = '/api/v1/contacts';

    return send.post(url, contact);
}

export async function updateContact(
    id: ContactId,
    contact: ContactFormData,
): Promise<ApiResponseSuccess<{ contact: Contact }>> {
    const url = `/api/v1/contacts/${id}`;

    return send.put(url, contact);
}

export async function deleteContact(id: ContactId): Promise<void> {
    const url = `/api/v1/contacts/${id}`;

    return send.del(url);
}
