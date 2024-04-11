import React, { useCallback, useMemo } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from 'react-use';

import { loadAddressGeocode } from '../../api/pay-api';
import { Box } from '../../components/box';
import { Form, FormAddressSelector, FormInput, FormSubmit } from '../../components/form';
import { Panel, PanelHeader } from '../../components/panel';
import { PanelWrapper } from '../../components/panel/wrapper';
import { Row } from '../../components/row';
import { Text } from '../../components/text';
import { counters } from '../../counters';
import { isGeoAddressWithoutRoom, isPayOwner } from '../../helpers/adresses';
import { history, Path } from '../../router';
import {
    getAddressById,
    getAddressFormData,
    getEditAddressStatus,
    updateAddress,
} from '../../store/addresses';
import { PlacemarkVariant, showSinglePlacemark } from '../../store/map';

import { AddressesDelete } from './delete';
import { fields, initialValues, validationSchema } from './helpers/forms';

interface AddressesEditProps {
    addressId: string;
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
    needsObFooter?: boolean;
}

const completeCallbackDefault = () => history.push(Path.Main);

export function AddressesEdit({
    addressId,
    obHeader,
    completeCallback = completeCallbackDefault,
    needsObFooter = false,
}: AddressesEditProps) {
    const dispatch = useDispatch();
    const updateAddressFn = useService(updateAddress);
    const [confirmRemove, toggleConfirmRemove] = useToggle(false);
    const address = useSelector(getAddressById)(addressId);
    const addressEditData = useSelector(getAddressFormData)(addressId);
    const editStatus = useSelector(getEditAddressStatus);

    const onSubmit = useCallback(
        (values: Checkout.AddressFormData) => {
            counters.addressEditFormSubmit({ id: addressId });

            updateAddressFn(addressId, values, completeCallback);
        },
        [updateAddressFn, addressId, completeCallback],
    );

    const onSelect = useCallback(async (value: string) => {
        counters.addressSuggestSelect();

        const result = await loadAddressGeocode(value);
        const { latitude, longitude } = result.data;

        dispatch(
            showSinglePlacemark({
                id: result.data.formatted_address,
                coordinates: { latitude, longitude },
                variant: PlacemarkVariant.pin,
            }),
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const header = useMemo(
        () =>
            obHeader || (
                <PanelHeader
                    title="Редактировать адрес"
                    backHref={Path.Addresses}
                    deleteAction={isPayOwner(address) ? toggleConfirmRemove : undefined}
                />
            ),
        [address, obHeader, toggleConfirmRemove],
    );

    const needAutofocusOnRoom = isGeoAddressWithoutRoom(address);

    return (
        <PanelWrapper>
            <Form
                initialValues={addressEditData || initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {() => (
                    <Panel
                        header={header}
                        footer={
                            <FormSubmit
                                size="l"
                                view="action"
                                variant="primary"
                                width="max"
                                progress={asyncData.isPending(editStatus)}
                            >
                                Сохранить
                            </FormSubmit>
                        }
                        needsObFooter={needsObFooter}
                    >
                        {!isPayOwner(address) ? (
                            <Box bottom="m">
                                <Text variant="s">
                                    В Яндекс ID будет храниться и старый, и измененный вариант
                                    адреса
                                </Text>
                            </Box>
                        ) : null}
                        <FormAddressSelector {...fields.address} onSelect={onSelect} />
                        <Row gap="m" top="m">
                            <FormInput
                                {...fields.room}
                                autoFocus={needAutofocusOnRoom}
                                counter={() => counters.addressEditTouchRoom({ id: addressId })}
                            />
                            <FormInput
                                {...fields.entrance}
                                counter={() => counters.addressEditTouchEntrance({ id: addressId })}
                            />
                        </Row>
                        <Row gap="m" top="m">
                            <FormInput
                                {...fields.intercom}
                                counter={() => counters.addressEditTouchIntercom({ id: addressId })}
                            />
                            <FormInput
                                {...fields.floor}
                                counter={() => counters.addressEditTouchFloor({ id: addressId })}
                            />
                        </Row>
                        <Box top="m">
                            <FormInput {...fields.comment} />
                        </Box>
                        {/*
                        <Box top="m">
                            <Button view="link" onClick={toggleAdditional}>
                                {`Домофон и этаж, комментарий ${additional ? '<' : '>'}`}
                            </Button>
                        </Box>
                        */}
                    </Panel>
                )}
            </Form>

            <AddressesDelete
                show={confirmRemove}
                addressId={addressId}
                onCancel={toggleConfirmRemove}
            />
        </PanelWrapper>
    );
}
