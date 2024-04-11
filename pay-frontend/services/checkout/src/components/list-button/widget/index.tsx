import React from 'react';

import { ListButtonDefault } from '..';
import { isTouchTemplate } from '../../../helpers/app';
import { Box } from '../../box';
import { Icon, SvgIcon } from '../../icons';
import { Text } from '../../text';
import { ListButtonProps } from '../base';

interface ListButtonWidgetProps {
    title?: string;
    description?: string;
    icon: SvgIcon;
    href: ListButtonProps['href'];
}

export const ListButtonWidget = ({
    title,
    description,
    href,
    icon,
}: ListButtonWidgetProps): JSX.Element => {
    const size = isTouchTemplate() ? 'l' : 'xl';

    return (
        <ListButtonDefault href={href} iconLeft={<Icon svg={icon} size="l" />} size={size}>
            <React.Fragment>
                {title ? (
                    <Box bottom={description ? '3xs' : undefined}>
                        <Text>{title}</Text>
                    </Box>
                ) : null}
                {description ? (
                    <Text color="grey" variant="s">
                        {description}
                    </Text>
                ) : null}
            </React.Fragment>
        </ListButtonDefault>
    );
};
