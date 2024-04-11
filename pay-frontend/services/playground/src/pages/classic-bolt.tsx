import * as React from 'react';

import { Layout, LayoutCell } from 'components/layout';
import { Header } from 'features/header';
import { Cart, Reset, Buttons, BillingContact } from 'features/options';
import { Preview } from 'features/preview';
import { YandexPayClassicBolt } from 'features/yandex-pay';

export function ClassicBolt() {
    const options = [
        <Reset />,
        <Cart dynamicCart plus />,
        <Buttons customSize />,
        <BillingContact />,
    ];

    const header = <Header />;
    const preview = <Preview button={YandexPayClassicBolt} />;

    return (
        <Layout header={header} main={preview}>
            {options.map((Option, idx) => (
                <LayoutCell key={idx}>{Option}</LayoutCell>
            ))}
        </Layout>
    );
}
