import React, { useState, useCallback } from 'react';

import {
    PaymentSheet,
    Order,
    ShippingType,
    ShippingAddress,
    ShippingOption,
    PickupBounds,
    PickupPoint,
    BillingContactInfo,
    ShippingContactInfo,
} from '@yandex-pay/sdk/src/typings';

import { Contact, UserCard, Address } from './typings';

interface StoreContextData {
    error: string;
    errors: string[];

    sheet: PaymentSheet;

    cards: UserCard[];

    addresses: Address[];
    contacts: Contact[];

    orderRendering?: boolean;

    order: Order;
    orderUpdating: boolean;

    shippingType?: ShippingType;

    shippingAddress?: ShippingAddress;
    shippingUpdating?: boolean;
    shippingOptions?: ShippingOption[];
    shippingOption?: ShippingOption;

    pickupBounds?: { label: string } & PickupBounds;
    pickupUpdating?: boolean;
    initialPickupPoints?: PickupPoint[];
    pickupPoints?: PickupPoint[];
    pickupPoint?: PickupPoint;

    billingContact?: BillingContactInfo;
    shippingContact?: ShippingContactInfo;

    paymentMethod?: UserCard;

    comment?: string;
}

interface StoreContext {
    data: StoreContextData;
    set: Sys.CallbackFn1<Partial<Record<keyof StoreContextData, any>>>;
}

const initialContext: StoreContext = {
    data: {
        error: '',
        errors: [],

        cards: [],
        contacts: [],
        addresses: [],

        sheet: {} as PaymentSheet,

        shippingType: ShippingType.Direct,

        order: {} as Order,
        orderUpdating: false,
    },
    set: () => null,
};

export const storeContext = React.createContext<StoreContext>(initialContext);

export function StoreContextProvider({ children }: { children: JSX.Element }): JSX.Element {
    const [data, setData] = useState(initialContext.data);

    const set = useCallback((patch: Partial<Record<keyof StoreContextData, any>>) => {
        setData((_data) => ({ ..._data, ...patch }));
    }, []);

    return React.createElement(
        storeContext.Provider,
        {
            value: { data, set },
        },
        children,
    );
}
