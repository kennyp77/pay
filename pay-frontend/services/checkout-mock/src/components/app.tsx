import React, { useContext, useEffect, useState } from 'react';

import { timeRace } from '@trust/utils/promise/time-race';
import { MessageType, PaymentMessage, PaymentMethodType } from '@yandex-pay/sdk/src/typings';

import * as api from '../api';
import { FormConnection, CheckoutApi } from '../connection';
import { storeContext } from '../store';
import { Contact, UserCard, Address } from '../typings';

import { Panel, List, Progress } from './_base';
import { requiredFields } from './_utils';
import { Cart } from './cart';
import { Contacts } from './contacts';
import { PaymentMethod } from './payment-method';
import { Shipping } from './shipping';
import { Submit } from './submit';

function transformCards(res: Sys.Return<typeof api.loadUserCards>): UserCard[] {
    return res.data.cards.map((card) => ({
        type: PaymentMethodType.Card,
        cardLast4: card.last4,
        cardNetwork: card.cardNetwork,
    }));

    // cards.push({
    //     type: PaymentMethodType.Cash,
    // });
}

function transformContacts(res: Sys.Return<typeof api.loadContacts>): Contact[] {
    return res.data.results.filter((item) => item.ownerService === 'pay');
}

function transformAddresses(res: Sys.Return<typeof api.loadAddresses>): Address[] {
    return res.data.results.filter((item) => item.ownerService === 'pay');
}

export function App() {
    const store = useContext(storeContext);
    const [init, setInit] = useState(false);

    const { error, errors } = store.data;

    const required = requiredFields(store.data.sheet);

    useEffect(() => {
        (async () => {
            try {
                const connection = FormConnection.getInstance();
                const checkoutApi = CheckoutApi.getInstance();

                const PAYMENT_TIMEOUT = 10000;
                const paymentPromise = new Promise<PaymentMessage>((resolve) =>
                    connection.once(MessageType.Payment, resolve),
                );

                const { sheet } = await timeRace(
                    paymentPromise,
                    PAYMENT_TIMEOUT,
                    new Error('The payment sheet was not provided'),
                );

                const [orderRes, cardsRes, addressesRes, contactsRes] = await Promise.all([
                    checkoutApi.initial(sheet),
                    api.loadUserCards(),
                    api.loadAddresses(),
                    api.loadContacts(),
                ]);

                store.set({
                    sheet: orderRes,
                    order: orderRes.order,
                    cards: transformCards(cardsRes),
                    contacts: transformContacts(contactsRes),
                    addresses: transformAddresses(addressesRes),
                });

                setInit(true);
            } catch (err) {
                store.set({ error: err.message });
                console.error(err);
            }
        })();
    }, []);

    if (!init && !error) {
        return (
            <div>
                <h1>Checkout 9000</h1>
                <br />
                <Progress />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Checkout 9000</h1>
                <br />
                <h2>Error!</h2>
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Checkout 9000</h1>
            {errors.length ? (
                <Panel title="Ошибки">
                    <List<string> list={errors} />
                </Panel>
            ) : null}
            <br />
            <Cart />
            <br />
            {required.shippingContact ? (
                <>
                    <Contacts />
                    <br />
                </>
            ) : null}
            <PaymentMethod />
            <br />
            {required.shippingMethod ? (
                <>
                    <Shipping />
                    <br />
                </>
            ) : null}
            <hr />
            <br />
            <Submit />
            <br />
            <br />
            <br />
        </div>
    );
}
