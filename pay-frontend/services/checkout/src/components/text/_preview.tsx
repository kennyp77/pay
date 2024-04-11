import React from 'react';

import { Preview } from '../_preview';

import { Text } from '.';

const dynamicProps = {
    color: ['black', 'grey', 'white'],
    variant: ['header-l', 'header-m', 'header-s', 'm', 's'],
    align: ['left', 'center', 'right'],
    overflow: { value: ['ellipsis'], optional: true },
    as: { comment: 'Тэг, по умолчанию span' },
    htmlFor: { comment: 'htmlFor для label' },
};

const staticProps = {
    children: (
        <>
            Алая вспышка осветила силуэт зазубренного крыла.
            <br />
            Almost before we knew it, we had left the ground.
        </>
    ),
};

const Canvas: React.FC = (props) => <div {...props} style={{ maxWidth: 300 }} />;

export const TextPreview = () => (
    <Preview title="Text" component={Text} dynamicProps={dynamicProps} staticProps={staticProps} canvas={Canvas} />
);
