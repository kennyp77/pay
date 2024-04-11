import React, { useCallback, useMemo } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useDispatch, useSelector } from 'react-redux';

import { loadAddressGeocode } from '../../api/pay-api';
import { Box } from '../../components/box';
import { Form, FormAddressSelector, FormInput, FormSubmit } from '../../components/form';
import { Panel, PanelHeader } from '../../components/panel';
import { PanelWrapper } from '../../components/panel/wrapper';
import { Row } from '../../components/row';
import { Text } from '../../components/text';
import { counters } from '../../counters';
import { history, Path } from '../../router';
import { createAddress, getAddAddressStatus, getIsEmptyAddressList } from '../../store/addresses';
import { PlacemarkVariant, showSinglePlacemark } from '../../store/map';
import { getIsSeveralShippingTypes } from '../../store/payment';
import { ShippingType } from '../../typings';
import { ShippingTypeComponent } from '../shipping-type';

import { fields, initialValues, validationSchema } from './helpers/forms';

interface AddressesAddProps {
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
    needsObFooter?: boolean;
}

const completeCallbackDefault = () => history.push(Path.Main);

export function AddressesAdd({
    obHeader,
    completeCallback = completeCallbackDefault,
    needsObFooter = false,
}: AddressesAddProps) {
    const dispatch = useDispatch();
    const createAddressFn = useService(createAddress);
    const addStatus = useSelector(getAddAddressStatus);
    const isEmptyAddressList = useSelector(getIsEmptyAddressList);
    const isSeveralShippingTypes = useSelector(getIsSeveralShippingTypes);

    const onSubmit = useCallback(
        (values) => {
            counters.addressAddFormSubmit();
            createAddressFn(values, completeCallback);
        },
        [createAddressFn, completeCallback],
    );

    const onSelect = useCallback(
        async (value: string) => {
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
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const header = useMemo(() => {
        return (
            obHeader || (
                <PanelHeader
                    title={isEmptyAddressList ? 'Доставка' : 'Новый адрес'}
                    backHref={isEmptyAddressList ? undefined : Path.Addresses}
                />
            )
        );
    }, [obHeader, isEmptyAddressList]);

    return (
        <PanelWrapper>
            <Form
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {() => (
                    <Panel
                        header={
                            <React.Fragment>
                                {header}
                                {isSeveralShippingTypes && isEmptyAddressList ? (
                                    <Row top="l">
                                        <ShippingTypeComponent page={ShippingType.Direct} />
                                    </Row>
                                ) : null}
                            </React.Fragment>
                        }
                        footer={
                            <FormSubmit
                                size="l"
                                view="action"
                                variant="primary"
                                width="max"
                                pin="round-m"
                                progress={asyncData.isPending(addStatus)}
                            >
                                Добавить
                            </FormSubmit>
                        }
                        needsObFooter={needsObFooter}
                    >
                        <Box bottom="m">
                            <Text variant="s">
                                Адрес сохранится в Yandex Pay, чтобы в следующий раз не вводить его
                                заново
                            </Text>
                        </Box>
                        <FormAddressSelector {...fields.address} onSelect={onSelect} />
                        <Row gap="m" top="m">
                            <FormInput {...fields.room} />
                            <FormInput {...fields.entrance} />
                        </Row>
                        <Row gap="m" top="m">
                            <FormInput {...fields.intercom} />
                            <FormInput {...fields.floor} />
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
        </PanelWrapper>
    );
}
