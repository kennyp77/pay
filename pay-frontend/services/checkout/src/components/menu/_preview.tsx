import React, { useState, useMemo, useCallback } from 'react';

import { Preview } from '../_preview';

import { Menu } from '.';

const Canvas: React.FC = (props) => (
    <div style={{ padding: 20 }}>
        <div {...props} />
    </div>
);

const dynamicProps = {
    size: ['s', 'm'],
    width: { optional: true, value: ['auto', 'max'] },
};

export const MenuPreview = () => {
    const [value, setValue] = useState([]);

    const onChange = useCallback((event) => setValue(event.target.value), []);

    const staticProps = useMemo(
        () => ({
            value,
            onChange,
            view: 'default',
            items: [
                {
                    value: 'id-1',
                    content: 'Item 1',
                },
                {
                    value: 'id-2',
                    content: 'Item 2',
                },
                {
                    value: 'id-3',
                    content: (
                        <div style={{ padding: '5px 0', lineHeight: '1.3em' }}>
                            <div>Item 3</div>
                            <div style={{ color: 'grey' }}>Sub-item 3</div>
                        </div>
                    ),
                },
            ],
        }),
        [value, onChange],
    );

    return (
        <Preview title="Menu" component={Menu} dynamicProps={dynamicProps} staticProps={staticProps} canvas={Canvas} />
    );
};
