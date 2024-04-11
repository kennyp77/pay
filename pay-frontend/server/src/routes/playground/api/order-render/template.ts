import { decodeMetadata, encodeMetadata, OrderMetadata } from '../_data/_shared/metadata';
import { getOrderCart } from '../_data/order';
import { getShippingItems } from '../_data/shipping';
import { RenderOrderRequest, RenderOrderResponse } from '../typings';

type AvailableCourierOptions = RenderOrderResponse['shipping']['availableCourierOptions'];
type AvailableShippingMethods = RenderOrderResponse['shipping']['availableMethods'];
type AvailablePaymentMethods = RenderOrderResponse['availablePaymentMethods'];

const HTTP_504_DELAY = 10 * 1000;

const pickValueFromList = (values: null | number[]) => {
    if (!values || values.length === 0) {
        return -1;
    }

    // NB: Специально выбран mutable метод!
    const value = values.length > 1 ? values.shift() : values[0];

    return value ?? -1;
};

function getAvailableShippingMethods(meta: OrderMetadata): AvailableShippingMethods {
    const methods: AvailableShippingMethods = [];

    meta.pickup.enabled && methods.push('PICKUP');
    meta.shipping.enabled && methods.push('COURIER');

    return methods;
}

function getAvailablePaymentMethods(meta: OrderMetadata): AvailablePaymentMethods {
    const methods: AvailablePaymentMethods = ['CARD'];

    meta.paymentMethods.cash && methods.push('CASH_ON_DELIVERY');
    meta.paymentMethods.split && methods.push('SPLIT');

    return methods;
}

function getCourierOptions(meta: OrderMetadata): null | AvailableCourierOptions {
    const value = pickValueFromList(meta.shipping.values);

    return value > 0 ? getShippingItems(value) : [];
}

export function renderOrder(payload: RenderOrderRequest): Promise<RenderOrderResponse> {
    const metadata = decodeMetadata(payload.metadata);

    const order: RenderOrderResponse = {
        currencyCode: metadata.currency,
        availablePaymentMethods: getAvailablePaymentMethods(metadata),
        requiredFields: {
            billingContact: metadata.billingContact,
            shippingContact: metadata.shippingContact,
        },
        shipping: {
            availableMethods: getAvailableShippingMethods(metadata),
        },
        cart: getOrderCart(metadata, payload.cart.items, payload.cart.coupons),
    };

    if (metadata.coupons.enabled) {
        order.enableCoupons = true;
    }

    if (payload.shippingAddress) {
        const courierOptions = getCourierOptions(metadata);

        if (courierOptions === null) {
            return new Promise((resolve) => setTimeout(resolve, HTTP_504_DELAY));
        }

        order.shipping.availableCourierOptions = courierOptions;
    }

    order.metadata = encodeMetadata(metadata);

    return Promise.resolve(order);
}
