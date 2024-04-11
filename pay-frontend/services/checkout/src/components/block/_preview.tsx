import React from 'react';

import { Preview } from '../_preview';

import { Block } from '.';

const sizes = ['3xl', '2xl', 'xl', 'l', 'm', 's', 'xs', '2xs', '3xs'];

const Canvas: React.FC = (props) => <div {...props} style={{ padding: 50, backgroundColor: '#d4d8e0' }} />;

const dynamicProps = {
    bg: { optional: true, value: ['white', 'grey'] },
    radius: { optional: true, value: sizes },
    shadow: true,
};

const staticProps = {
    children: <div style={{ width: '100%', height: 100 }} />,
};

export const BlockPreview = () => (
    <Preview title="Block" component={Block} dynamicProps={dynamicProps} staticProps={staticProps} canvas={Canvas} />
);
