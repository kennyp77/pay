import * as Sdk from '@yandex-pay/sdk/src/typings';

import { getPaymentSheet } from '../../helpers/payment-sheet';

export const SUCCESSFUL_PAYMENT: Sdk.PaymentSheet = getPaymentSheet();

export const INVALID_MERCHANT_PAYMENT: Sdk.PaymentSheet = getPaymentSheet({
    merchant: {
        id: 'invalid-id',
        name: 'invalid-merchant',
    },
});

export const SHIPPING_VARIANTS = {
    empty: [] as any,
    label_without_date: [
        {
            id: 'COURIER-1',
            provider: 'COURIER' as const,
            label: 'Курьером по Москве (в пределах МКАД)',
            amount: '350',
        },
        {
            id: 'COURIER-2',
            provider: 'COURIER' as const,
            label: 'Доставка курьером до метро (за МКАД)',
            amount: '350',
        },
        {
            id: 'CDEK-1',
            provider: 'CDEK' as const,
            label: 'Курьером СДЭК (за МКАД и в Подмосковье)',
            amount: '600',
        },
        { id: 'CDEK-2', provider: 'CDEK' as const, label: 'Курьерская служба СДЭК', amount: '690' },
        { id: 'EMS-1', provider: 'EMS' as const, label: 'EMS Почта России', amount: '890' },
        {
            id: 'DHL-1',
            provider: 'DHL' as const,
            label: 'Служба курьерской доставки DHL',
            amount: '1200',
        },
        {
            id: 'RUSSIAN_POST-1',
            provider: 'RUSSIAN_POST' as const,
            label: 'Почта России',
            amount: '490',
        },
    ],
};
