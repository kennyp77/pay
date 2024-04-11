import * as React from 'react';

import { Layout, LayoutCell } from 'components/layout';
import { Header } from 'features/header';
import {
    Cart,
    Pickup,
    Shipping,
    ShippingContact,
    Coupons,
    Reset,
    Buttons,
    BillingContact,
} from 'features/options';
import { Preview } from 'features/preview';
import { YandexPayCheckoutBold } from 'features/yandex-pay';

export function CheckoutBolt() {
    const options = [
        <Reset />,
        <Buttons customSize />,
        <Cart cash dynamicCart plus receipt />,
        <ShippingContact />,
        <Shipping />,
        <Pickup />,
        <Coupons />,
        <BillingContact />,
    ];

    const header = <Header />;
    const preview = <Preview button={YandexPayCheckoutBold} />;

    return (
        <Layout header={header} main={preview}>
            {options.map((Option, idx) => (
                <LayoutCell key={idx}>{Option}</LayoutCell>
            ))}
        </Layout>
    );
}
