import React, { useContext, useCallback, useState } from 'react';

import { ProcessEvent, ShippingType, PaymentMethodType } from '@yandex-pay/sdk/src/typings';

import { FormConnection, CheckoutApi } from '../connection';
import { storeContext } from '../store';

import { Progress } from './_base';
import { isEmpty, isArray, requiredFields } from './_utils';

export function Submit() {
    const store = useContext(storeContext);

    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState(null);

    const {
        shippingContact,
        shippingType,
        shippingAddress,
        shippingOptions,
        shippingOption,
        pickupPoint,
        paymentMethod,
        orderRendering,
    } = store.data;

    const required = requiredFields(store.data.sheet);

    const onSubmit = useCallback(async () => {
        let order;

        try {
            order = await CheckoutApi.getInstance().createOrder(
                store.data.paymentMethod,
                store.data.shippingContact,
            );
        } catch (err) {
            console.error(err);

            return setError('Ошибка при подтверждении платежа');
        }

        const processData: Omit<ProcessEvent, 'type'> = {
            paymentMethodInfo: {
                type: PaymentMethodType.Card,
                cardLast4: store.data.paymentMethod.last4,
                cardNetwork: store.data.paymentMethod.cardNetwork,
            },
            // @ts-ignore
            orderId: order.orderId,
        };

        FormConnection.getInstance().processPayment(processData);

        setDisabled(true);
    }, [store.data, setError]);

    if (required.shippingContact && !shippingContact) {
        return <div style={{ color: 'red' }}>Выберите получателя</div>;
    }

    if (!paymentMethod) {
        return <div style={{ color: 'red' }}>Выберите карту</div>;
    }

    if (required.shippingMethod && !shippingType) {
        return <div style={{ color: 'red' }}>Выберите тип доставки</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (required.shippingPickup && shippingType === ShippingType.Pickup) {
        return <div style={{ color: 'red' }}>Выберите место самовывоза</div>;
    }

    if (required.shippingPickup && shippingType === ShippingType.Pickup && !pickupPoint) {
        return <div style={{ color: 'red' }}>Выберите пункт самовывоза</div>;
    }

    if (required.shippingDirect && shippingType === ShippingType.Direct && !shippingAddress) {
        return <div style={{ color: 'red' }}>Выберите адрес доставки</div>;
    }

    if (
        required.shippingDirect &&
        shippingType === ShippingType.Direct &&
        isArray(shippingOptions) &&
        !isEmpty(shippingOptions) &&
        !shippingOption
    ) {
        return <div style={{ color: 'red' }}>Выберите вариант доставки</div>;
    }

    if (orderRendering) {
        return <Progress />;
    }

    return (
        <button onClick={onSubmit} disabled={disabled}>
            Оплатить
        </button>
    );
}
