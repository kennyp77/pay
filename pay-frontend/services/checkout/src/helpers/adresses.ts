import sort from '@tinkoff/utils/array/sort';
import memoizeDeep from '@tinkoff/utils/function/memoize/deep';
import equal from '@tinkoff/utils/is/equal';
import pick from '@tinkoff/utils/object/pick';
import { move } from '@trust/utils/array';
import { readableValues } from '@trust/utils/object/readable-values';

import { SERVICE_OWNER_PAY } from '../config';

export const READABLE_ADDRESS_TYPE: Record<string, string> = {
    work: 'Работа',
    home: 'Дом',
};

export const READABLE_ADDRESS_FIELDS = {
    entrance: 'подъезд',
    intercom: 'домофон',
    floor: 'этаж',
};

export const getReadableAddress = memoizeDeep((address?: Checkout.Address): string => {
    return readableValues({}, address, ['locality', 'street', 'building', 'room']).join(', ');
});

export const getReadableAddressAdditional = memoizeDeep((address?: Checkout.Address): string => {
    return readableValues(READABLE_ADDRESS_FIELDS, address, ['entrance', 'intercom', 'floor']).join(
        ', ',
    );
});

export const isPayOwner = (address?: Checkout.Address): boolean => {
    return address?.ownerService === SERVICE_OWNER_PAY;
};

export const sortAddressList = (
    list: Checkout.Address[],
    selectedId?: string,
): Checkout.Address[] => {
    const sortedList = sort((address1, address2) => isPayOwner(address2), list);

    const selectedAddress = sortedList.find((item) => item.id === selectedId);

    if (selectedAddress && isPayOwner(selectedAddress)) {
        move(sortedList, sortedList.indexOf(selectedAddress), 0);
    }

    return sortedList;
};

export const isGeoAddressWithoutRoom = (address?: Checkout.Address) => {
    const profileAddresses = ['home', 'work'];

    if (address) {
        return profileAddresses.includes(address.type) && !address.room;
    }

    return false;
};

const getAddressForCompare = (address: object) => {
    return pick(
        [
            'building',
            'comment',
            'country',
            'entrance',
            'floor',
            'intercom',
            'region',
            'locality',
            'room',
            'street',
        ],
        address,
    );
};

export const isEqual = (address1: any, address2: any) => {
    return equal(getAddressForCompare(address1), getAddressForCompare(address2));
};
