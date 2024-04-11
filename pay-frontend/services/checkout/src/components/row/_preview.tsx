import React from 'react';

import { Preview } from '../_preview';

import { Row } from '.';

const sizes = ['3xl', '2xl', 'xl', 'l', 'm', 's', 'xs', '2xs', '3xs'];

const Canvas: React.FC = (props) => <div {...props} style={{ backgroundColor: '#eceef2' }} />;

const RowSpacer: React.FC = () => <Row.Spacer style={{ alignSelf: 'stretch', backgroundColor: '#d4d8e0' }} />;

const Block: React.FC<{ width: number; height: number }> = ({ width, height, ...props }) => (
    <div {...props} style={{ width, height, backgroundColor: '#ffdc60' }} />
);

const dynamicProps = {
    gap: { optional: true, value: sizes },
    align: { optional: true, value: ['start', 'center', 'end', 'baseline'] },
    justify: { optional: true, value: ['start', 'center', 'end', 'between', 'around'] },
};

const staticProps = {
    children: [
        <Block key={0} width={20} height={20} />,
        <Block key={1} width={30} height={30} />,
        <Block key={2} width={40} height={40} />,
        <Block key={3} width={50} height={50} />,
    ],
};

export const RowPreview = () => (
    <Preview title="Row" component={Row} dynamicProps={dynamicProps} staticProps={staticProps} canvas={Canvas} />
);

const spacerStaticProps = {
    children: [
        <Block key={0} width={20} height={20} />,
        <Block key={1} width={30} height={30} />,
        <Block key={2} width={40} height={40} />,
        <RowSpacer key={99} />,
        <Block key={3} width={50} height={50} />,
    ],
};

export const RowSpacerPreview = () => (
    <Preview
        title="Row with Spacer"
        component={Row}
        dynamicProps={dynamicProps}
        staticProps={spacerStaticProps}
        canvas={Canvas}
    />
);
