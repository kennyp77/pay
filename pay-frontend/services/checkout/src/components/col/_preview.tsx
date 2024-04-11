import React from 'react';

import { Preview } from '../_preview';

import { Col } from '.';

const sizes = ['3xl', '2xl', 'xl', 'l', 'm', 's', 'xs', '2xs', '3xs'];

const Canvas: React.FC = (props) => <div {...props} style={{ width: 70, height: 300, backgroundColor: '#eceef2' }} />;

const Block: React.FC<{ width: number; height: number }> = ({ width, height, ...props }) => (
    <div {...props} style={{ width, height, backgroundColor: '#ffdc60' }} />
);

const dynamicProps = {
    gap: { optional: true, value: sizes },
    justify: { optional: true, value: ['start', 'center', 'end'] },
};

const staticProps = {
    children: [
        <Block key={0} width={20} height={20} />,
        <Block key={1} width={30} height={30} />,
        <Block key={2} width={40} height={40} />,
        <Block key={3} width={50} height={50} />,
    ],
};

export const ColPreview = () => (
    <Preview title="Col" component={Col} dynamicProps={dynamicProps} staticProps={staticProps} canvas={Canvas} />
);
