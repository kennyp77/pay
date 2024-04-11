import React from 'react';

import { Preview } from '../_preview';

import { RadioButton } from '.';

const dynamicProps = {
    size: ['m', 'l'],
};

const staticProps = {
    view: 'default',
    size: 'm',
    options: [
        { value: 'a', children: 'Option A' },
        { value: 'b', children: 'Option B' },
        { value: 'c', children: 'Option C' },
    ],
    value: 'a',
};

export const RadioButtonPreview = () => (
    <Preview title="RadioButton" component={RadioButton} dynamicProps={dynamicProps} staticProps={staticProps} />
);
