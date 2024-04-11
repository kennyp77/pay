import propOr from '@tinkoff/utils/object/propOr';
import { OrderItemQuantity } from '@yandex-pay/sdk/src/typings';

const i18n = (v: string) => v;

const getQuantityNumber = (quantity: any) => parseFloat(quantity);

const checkQuantity = (quantity: any) => {
    return quantity && !Number.isNaN(getQuantityNumber(quantity));
};

const getQuantityWithLabel = (quantity: any, label: string) => {
    return `${getQuantityNumber(quantity)} ${label}`;
};

export const getReadableQuantity = (quantity: OrderItemQuantity): string => {
    const count = propOr('count', '', quantity);

    if (checkQuantity(count)) {
        const label = propOr('label', i18n('шт'), quantity);

        return getQuantityWithLabel(count, label);
    }

    return '';
};
