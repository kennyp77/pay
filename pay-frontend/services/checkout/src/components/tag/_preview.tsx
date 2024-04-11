import React from 'react';

import { Preview } from '../_preview';

import { Tag } from '.';

const dynamicProps = {
    size: ['s', 'm'],
    color: { optional: true, value: ['red'] },
    disabled: false,
    onClose: { optional: true, value: (): void => null },
};

const staticProps = {
    children: 'Автозапчасти',
};

export const TagPreview = () => (
    <Preview title="Tag" component={Tag} dynamicProps={dynamicProps} staticProps={staticProps} />
);
