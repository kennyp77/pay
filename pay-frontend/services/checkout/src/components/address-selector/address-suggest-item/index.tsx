import * as React from 'react';

import { cn } from '@bem-react/classname';

import { Col } from '../../col';
import { Text } from '../../text';

export interface AddressSuggestItemProps {
    className?: string;
    title: string;
    subtitle: string;
}

export const cnAddressSuggestItem = cn('AddressSuggestItem');

export const AddressSuggestItem = function AddressSuggestItem({
    className,
    title,
    subtitle,
}: AddressSuggestItemProps) {
    return (
        <Col top="l" bottom="l" className={cnAddressSuggestItem({}, [className])}>
            <Text className={cnAddressSuggestItem('Title')}>{title}</Text>
            <Text className={cnAddressSuggestItem('Subtitle')} color="grey" variant="s" top="3xs">
                {subtitle}
            </Text>
        </Col>
    );
};
