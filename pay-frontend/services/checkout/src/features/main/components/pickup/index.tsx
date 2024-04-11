import React, { useMemo } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { useSelector } from 'react-redux';

import { Amount } from '../../../../components/amount';
import { Box } from '../../../../components/box';
import { Col, ColProps } from '../../../../components/col';
import { Icon } from '../../../../components/icons';
import { ListButtonDefault } from '../../../../components/list-button';
import { Text } from '../../../../components/text';
import { isFree } from '../../../../helpers/amount';
import { getReadableContact } from '../../../../helpers/contacts';
import { Path } from '../../../../router';
import { getSelectedContact } from '../../../../store/contacts';
import { getCurrencyCode } from '../../../../store/payment';
import { getPickupSelectedPoint } from '../../../../store/pickup';
import { PickupInfo } from '../../../pickup-selected/components/pickup-info';
import PersonIcon from '../../assets/person.svg';

import './styles.scss';

interface MainPickupBlockProps extends IClassNameProps, ColProps {
    size: 'l' | 'xl';
    separator?: React.ReactElement;
}

export const cnMainPickupBlock = cn('MainPickupBlock');

const i18n = (v: string) => v;

export function MainPickupBlock({ size, separator, ...props }: MainPickupBlockProps) {
    const point = useSelector(getPickupSelectedPoint);
    const currencyCode = useSelector(getCurrencyCode);
    const contact = useSelector(getSelectedContact);

    const readableContact = useMemo(() => getReadableContact(contact), [contact]);

    return (
        <Col className={cnMainPickupBlock()} {...props}>
            <ListButtonDefault href={Path.Pickup} size={size}>
                {point ? (
                    <Text className={cnMainPickupBlock('Address')} variant="header-l">
                        {`${i18n('Самовывоз')}. ${point.address}`},{' '}
                        <span className={cnMainPickupBlock('Amount')}>
                            {isFree(point.amount) ? (
                                i18n('бесплатно')
                            ) : (
                                <Amount amount={point.amount} currency={currencyCode} />
                            )}
                        </span>
                    </Text>
                ) : (
                    <Text color="grey" variant="s">
                        {i18n('Выберите пункт самовывоза')}
                    </Text>
                )}
            </ListButtonDefault>

            {point && (
                <Box left={size} bottom="s" top="s">
                    <PickupInfo pickupPoint={point} top="2xs" />
                </Box>
            )}

            {separator}

            <ListButtonDefault
                href={Path.Contacts}
                iconLeft={<Icon svg={PersonIcon} size="l" />}
                size={size}
            >
                {contact ? (
                    <React.Fragment>
                        <Box bottom="3xs">
                            <Text>{readableContact}</Text>
                        </Box>
                        <Text color="grey" variant="s">
                            {contact.phoneNumber}
                        </Text>
                    </React.Fragment>
                ) : (
                    <Text color="grey" variant="s">
                        {i18n('Выберите получателя')}
                    </Text>
                )}
            </ListButtonDefault>
        </Col>
    );
}
