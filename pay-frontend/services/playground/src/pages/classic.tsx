import * as React from 'react';

import { Layout, LayoutCell } from 'components/layout';
import { Header } from 'features/header';
import { Buttons, Cart, Additional, Reset, BillingContact } from 'features/options';
import { Preview } from 'features/preview';
import { YandexPayClassic } from 'features/yandex-pay';

export function Classic() {
    const options = [
        <Reset />,
        <Cart country cash split plus chaas merchant />,
        <Buttons type theme width newButton customSize />,
        <BillingContact />,
        <Additional />,
    ];

    const header = <Header />;
    const preview = <Preview button={YandexPayClassic} />;

    return (
        <Layout header={header} main={preview}>
            {options.map((Option, idx) => (
                <LayoutCell key={idx}>{Option}</LayoutCell>
            ))}
        </Layout>
    );
}
