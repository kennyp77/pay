import React, { useMemo } from 'react';

import { IClassNameProps } from '@bem-react/core';
import { useSelector } from 'react-redux';

import { Col, ColProps } from '../../../../components/col';
import { Icon } from '../../../../components/icons';
import { ListButtonDefault } from '../../../../components/list-button';
import { ListButtonWidget } from '../../../../components/list-button/widget';
import { Text } from '../../../../components/text';
import { getReadableAddress } from '../../../../helpers/adresses';
import { getReadableContact } from '../../../../helpers/contacts';
import { Path } from '../../../../router';
import { getSelectedAddress } from '../../../../store/addresses';
import { getSelectedContact } from '../../../../store/contacts';
import PersonIcon from '../../assets/person.svg';

import LocationIcon from './assets/location.svg';
import { MainDeliveryShipping } from './shipping';

interface MainDeliveryBlockProps extends IClassNameProps, ColProps {
    size: 'l' | 'xl';
    separator?: React.ReactElement;
}

const i18n = (v: string) => v;

export function MainDeliveryBlock({
    size,
    separator,
    ...props
}: MainDeliveryBlockProps): JSX.Element {
    const contact = useSelector(getSelectedContact);
    const address = useSelector(getSelectedAddress);

    const readableAddress = useMemo(() => getReadableAddress(address), [address]);
    const readableContact = useMemo(() => getReadableContact(contact), [contact]);

    return (
        <Col {...props}>
            <MainDeliveryShipping size={size} />

            {separator}

            <ListButtonDefault
                href={Path.Addresses}
                iconLeft={<Icon svg={LocationIcon} size="l" />}
                size={size}
            >
                {address ? (
                    <Text>{readableAddress}</Text>
                ) : (
                    <Text color="grey" variant="s">
                        {i18n('Выберите адрес доставки')}
                    </Text>
                )}
            </ListButtonDefault>

            {separator}

            <ListButtonWidget
                href={Path.Contacts}
                icon={PersonIcon}
                title={contact ? readableContact : undefined}
                description={contact ? contact.phoneNumber : i18n('Выберите получателя')}
            />
        </Col>
    );
}
