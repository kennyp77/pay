import { Path, PathObj } from '../router';

interface UserData {
    addressId: Checkout.AddressId;
    contactId: Checkout.ContactId;
    contactsList: Checkout.Contact[];
    addressesList: Checkout.Address[];
}

const pathObj = (path: string): PathObj => {
    const [pathname, search] = path.split('?');

    return { pathname, search: search ? `?${search}` : undefined };
};

export const getObSteps = (lastState: Checkout.UserState, userData: UserData): Checkout.ObSteps => {
    // Есть ли валидный выбранный адрес/контакт
    const hasSelectedAddress = Boolean(userData.addressId);
    const hasSelectedContact = Boolean(userData.contactId);

    // Нужен ли онбординг
    const obAddress = !(hasSelectedAddress && lastState.addressId === userData.addressId);
    const obContact = !(hasSelectedContact && lastState.contactId === userData.contactId);

    // Урл шага страницы онбординга
    const addressHref = hasSelectedAddress ? Path.Addresses : Path.AddressesAdd;
    const contactHref = hasSelectedContact ? Path.Contacts : Path.ContactsAdd;

    // Урлы "назад" со страницы добавления
    // Отсутствуют, если добавление это страница шага
    const addressAddPrevHref = addressHref === Path.AddressesAdd ? undefined : Path.Addresses;
    const contactAddPrevHref = contactHref === Path.ContactsAdd ? undefined : Path.Contacts;

    const completeHref = Path.Main;

    // Нужно ли предзаполнить форму контакта
    const fillContactAddForm = !hasSelectedContact && userData.contactsList.length == 0;

    if (obAddress && obContact) {
        return {
            active: true,
            totalSteps: 3,
            startHref: pathObj(addressHref),
            address: { step: 1, completeHref: contactHref, addPrevHref: addressAddPrevHref },
            contact: {
                step: 2,
                completeHref,
                // С контактов всегда уходим на список адресов, т.к. там уже будет выбранный адрес
                prevHref: Path.Addresses,
                addPrevHref: contactAddPrevHref,
                addFillForm: fillContactAddForm,
            },
            addressOnboarded: !obAddress,
            contactOnboarded: !obContact,
            pickupOnboarded: false,
        };
    }

    if (obAddress || obContact) {
        return {
            active: true,
            totalSteps: 2,
            startHref: pathObj(obAddress ? addressHref : contactHref),
            address: { step: 1, completeHref, addPrevHref: addressAddPrevHref },
            contact: {
                step: 1,
                completeHref,
                addPrevHref: contactAddPrevHref,
                addFillForm: fillContactAddForm,
            },
            addressOnboarded: !obAddress,
            contactOnboarded: !obContact,
            pickupOnboarded: false,
        };
    }

    return {
        active: false,
        totalSteps: 0,
        startHref: pathObj(completeHref),
        contact: { step: 0, completeHref },
        address: { step: 0, completeHref },
        addressOnboarded: !obAddress,
        contactOnboarded: !obContact,
        pickupOnboarded: false,
    };
};

export const getIsFullOnboarded = (obSteps: Checkout.ObSteps): boolean => {
    return obSteps.contactOnboarded && (obSteps.addressOnboarded || obSteps.pickupOnboarded);
};
