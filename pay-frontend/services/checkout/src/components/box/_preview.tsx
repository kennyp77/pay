import React from 'react';

import { Preview } from '../_preview';

import { Box } from '.';

const sizes = ['3xl', '2xl', 'xl', 'l', 'm', 's', 'xs', '2xs', '3xs'];

const Canvas: React.FC = (props) => (
    <div {...props} style={{ display: 'inline-block', overflow: 'hidden', backgroundColor: '#eceef2' }} />
);

const dynamicProps = {
    top: { optional: true, value: sizes },
    right: { optional: true, value: sizes },
    bottom: { optional: true, value: sizes },
    left: { optional: true, value: sizes },
    all: { optional: true, value: sizes },
};

const staticProps = {
    children: <div style={{ width: 50, height: 50, backgroundColor: '#ffdc60' }} />,
};

export const BoxPreview = () => (
    <Preview title="Box" component={Box} dynamicProps={dynamicProps} staticProps={staticProps} canvas={Canvas} />
);
