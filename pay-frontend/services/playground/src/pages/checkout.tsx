import * as React from 'react';

import { Layout, LayoutCell } from 'components/layout';
import { Header } from 'features/header';
import { Cart, Pickup, Shipping, ShippingContact, Coupons, Reset, Buttons } from 'features/options';
import { Preview } from 'features/preview';
import { YandexPayCheckout } from 'features/yandex-pay';

export function Checkout() {
    const options = [
        <Reset />,
        <Buttons customSize />,
        <Cart country cash split plus chaas merchant />,
        <ShippingContact />,
        <Shipping />,
        <Pickup setup />,
        <Coupons />,
    ];

    const header = <Header />;
    const preview = <Preview button={YandexPayCheckout} />;

    return (
        <Layout header={header} main={preview}>
            {options.map((Option, idx) => (
                <LayoutCell key={idx}>{Option}</LayoutCell>
            ))}
        </Layout>
    );
}
