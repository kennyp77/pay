import React, { useMemo } from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { RadioButton } from '../../components/radio-button';
import { Row } from '../../components/row';
import { history, Path } from '../../router';
import { getIsEmptyAddressList } from '../../store/addresses';
import { ShippingType } from '../../typings';

import './styles.scss';

interface ShippingTypeComponentProps {
    page: ShippingType;
}

const cnShippingTypeComponent = cn('ShippingTypeComponent');

const i18n = (v: string) => v;

const types = [
    { value: ShippingType.Direct, children: i18n('Курьером') },
    { value: ShippingType.Pickup, children: i18n('Самовывоз') },
];

export function ShippingTypeComponent({ page }: ShippingTypeComponentProps) {
    const isEmptyAddressList = useSelector(getIsEmptyAddressList);

    const paths = useMemo(
        () => ({
            [ShippingType.Direct]: isEmptyAddressList ? Path.AddressesAdd : Path.Addresses,
            [ShippingType.Pickup]: Path.Pickup,
        }),
        [isEmptyAddressList],
    );

    return (
        <Row>
            <RadioButton
                className={cnShippingTypeComponent('Radio')}
                size="l"
                view="default"
                options={types}
                onChange={(event) => history.push(paths[event.target.value as ShippingType])}
                value={page}
            ></RadioButton>
        </Row>
    );
}
