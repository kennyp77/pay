import React from 'react';

import { Preview } from '../_preview';

import { Button } from '.';

const dynamicProps = {
    size: ['s', 'm', 'l'],
    view: ['action', 'default', 'clear', 'pseudo', 'link', 'invisible'],
    pin: { optional: true, value: ['circle-circle', 'round-m'] },
    width: { optional: true, value: ['max'] },
    progress: false,
    disabled: false,
};

const staticProps = {
    view: 'default',
    children: 'Push me',
};

export const ButtonPreview = () => (
    <Preview title="Button" component={Button} dynamicProps={dynamicProps} staticProps={staticProps} />
);

const staticPriceProps = {
    view: 'action',
    size: 'l',
    variant: 'price',
    children: 'Push me',
};

const dynamicPriceProps = {
    pin: { optional: true, value: ['circle-circle', 'round-m'] },
    width: { optional: true, value: ['max'] },
    progress: false,
    disabled: false,
    amount: ['3650.8', '10.04', '100500', '999.99'],
    currency: ['RUB', 'BYN', 'USD', 'EUR', 'GBP', 'PLUS'],
};

export const ButtonPricePreview = () => (
    <Preview title="ButtonPrice" component={Button} dynamicProps={dynamicPriceProps} staticProps={staticPriceProps} />
);
