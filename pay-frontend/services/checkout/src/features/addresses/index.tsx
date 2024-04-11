import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useDispatch, useSelector } from 'react-redux';

import { AddressContent } from '../../components/address-content';
import { Button } from '../../components/button';
import { Icon } from '../../components/icons';
import { ListButtonDefault, ListButtonRadio } from '../../components/list-button';
import { Panel, PanelHeader } from '../../components/panel';
import { Text } from '../../components/text';
import { counters } from '../../counters';
import { isPayOwner } from '../../helpers/adresses';
import { history, Path } from '../../router';
import { getAddressList, getSelectedAddressId, selectAddress } from '../../store/addresses';
import { showSinglePlacemark, PlacemarkVariant } from '../../store/map';
import { getIsSeveralShippingTypes } from '../../store/payment';
import { ShippingType } from '../../typings';
import { ShippingTypeComponent } from '../shipping-type';

import PlusIcon from './assets/plus.svg';

const i18n = (v: string) => v;

interface AddressesProps {
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn1<Checkout.Address | undefined>;
    needsObFooter?: boolean;
}

const completeCallbackDefault = () => history.push(Path.Main);

const getAddress = (list: Checkout.Address[], id: Checkout.AddressId) => {
    return list.find((item) => item.id === id) || null;
};

const insertSeparator = (list: Checkout.Address[], idx: number) => {
    return idx === 0
        ? true
        : list[idx].ownerService !== list[idx - 1].ownerService && isPayOwner(list[idx - 1]);
};

export function Addresses({
    obHeader,
    completeCallback = completeCallbackDefault,
    needsObFooter = false,
}: AddressesProps) {
    const dispatch = useDispatch();
    const selectAddressFn = useService(selectAddress);

    const list = useSelector(getAddressList);
    const selectedAddressId = useSelector(getSelectedAddressId);
    const isSeveralShippingTypes = useSelector(getIsSeveralShippingTypes);
    const [selectedId, setSelected] = useState(selectedAddressId);

    const onAddressSubmit = useCallback(() => {
        selectAddressFn(selectedId, completeCallback);
    }, [selectAddressFn, selectedId, completeCallback]);

    const onSelectAddress = useCallback((addressId) => {
        counters.changeDeliveryAddress({ id: addressId });
        setSelected(addressId);
    }, []);

    const header = useMemo(() => {
        return (
            obHeader || (
                <PanelHeader
                    title="Доставка"
                    closeHref={selectedAddressId ? Path.Main : undefined}
                />
            )
        );
    }, [obHeader, selectedAddressId]);

    useEffect(() => {
        if (selectedId) {
            const address = getAddress(list, selectedId);

            if (address) {
                dispatch(
                    showSinglePlacemark({
                        id: address.id,
                        coordinates: address.location,
                        variant: PlacemarkVariant.pin,
                    }),
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list, selectedId]);

    return (
        <Panel
            header={header}
            footer={
                <Button
                    size="l"
                    view="action"
                    variant="primary"
                    width="max"
                    pin="round-m"
                    disabled={!selectedId}
                    onClick={onAddressSubmit}
                >
                    {i18n('Продолжить')}
                </Button>
            }
            needsObFooter={needsObFooter}
        >
            {isSeveralShippingTypes && <ShippingTypeComponent page={ShippingType.Direct} />}

            {list.map((address, idx) => (
                <React.Fragment key={address.id}>
                    {insertSeparator(list, idx) ? (
                        <Text bottom="xs" top="m" color="grey" variant="s">
                            {isPayOwner(address) ? i18n('Мои адреса') : i18n('Адреса из Яндекс ID')}
                        </Text>
                    ) : null}
                    <ListButtonRadio
                        size="m"
                        bottom="xs"
                        active={selectedId === address.id}
                        onClick={() => onSelectAddress(address.id)}
                        hrefRight={Path.AddressesEdit(address)}
                        radioPosition="left"
                    >
                        <AddressContent address={address} />
                    </ListButtonRadio>
                </React.Fragment>
            ))}
            <ListButtonDefault
                size="m"
                iconLeft={<Icon svg={PlusIcon} size="l" />}
                href={Path.AddressesAdd}
            >
                <Text variant="m">{i18n('Новый адрес доставки')}</Text>
            </ListButtonDefault>
        </Panel>
    );
}
