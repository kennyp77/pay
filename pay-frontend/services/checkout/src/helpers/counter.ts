import fromPairs from '@tinkoff/utils/object/fromPairs';

type AddressWithoutSensitiveInformation = {
    id: string;
    floor: boolean;
    room: boolean;
    entrance: boolean;
    intercom: boolean;
    comment: boolean;
};

function removeSensitiveFromAddress(address: Checkout.Address): AddressWithoutSensitiveInformation {
    return {
        id: address.id,
        floor: Boolean(address.floor),
        room: Boolean(address.room),
        entrance: Boolean(address.entrance),
        intercom: Boolean(address.intercom),
        comment: Boolean(address.comment),
    };
}

export function prepareAddressesListForCount(list: Checkout.Address[]) {
    const toPairsFrom1 = (arr: any[]): Array<[number, any]> =>
        arr.map((data, idx) => [idx + 1, data]);

    return fromPairs(toPairsFrom1(list.map(removeSensitiveFromAddress)));
}
