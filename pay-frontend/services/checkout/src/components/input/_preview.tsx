import React from 'react';

import { Preview } from '../_preview';

import { Input } from '.';

const dynamicProps = {
    size: ['m'],
    hint: { optional: true, value: 'Hint message' },
    state: { optional: true, value: ['error'] },
    valid: false,
    progress: false,
    disabled: false,
};

const staticProps = {
    label: 'Input label',
    variant: 'filled',
    view: 'material',
};

export const InputPreview = () => (
    <Preview title="Input" component={Input} dynamicProps={dynamicProps} staticProps={staticProps} />
);
