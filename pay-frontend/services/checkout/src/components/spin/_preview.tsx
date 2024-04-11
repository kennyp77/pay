import React from 'react';

import { Preview } from '../_preview';

import { Spin } from '.';

const dynamicProps = {
    size: ['xxs', 'xs'],
    progress: true,
};

const staticProps = {
    view: 'default',
};

export const SpinPreview = () => (
    <Preview title="Spin" component={Spin} dynamicProps={dynamicProps} staticProps={staticProps} />
);
