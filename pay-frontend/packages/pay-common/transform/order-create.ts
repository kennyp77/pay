import {
    RenderOrderResponse,
    ShippingCourierOption,
    ShippingPickupOption,
    CreateOrderRequest,
} from '@trust/pay-api';
import { sumAmount } from '@trust/utils/math/amount';
import { PaymentMethodType } from '@trust/utils/payment-methods/typings';

const getTotalAmount = (order: RenderOrderResponse, shippingAmount: Sdk.Price = '0'): Sdk.Price => {
    const itemsAmount = order.cart.items.map((item) => item.total);

    return sumAmount(shippingAmount, ...itemsAmount);
};

export function paymentSheetToOrderCreate({
    initSheet,
    order,
    paymentMethodType,
    paymentMethod,
    address,
    shippingContact,
    billingContact,
    courierOption,
    pickupOption,
}: {
    initSheet: Sdk.InitPaymentSheet;
    order: RenderOrderResponse;
    paymentMethod?: Checkout.PaymentMethod;
    paymentMethodType: PaymentMethodType;
    address?: Checkout.Address;
    shippingContact?: Checkout.CheckoutShippingMethodContactData;
    billingContact?: Checkout.BillingContact;
    courierOption?: ShippingCourierOption;
    pickupOption?: ShippingPickupOption;
}): CreateOrderRequest {
    const payload: CreateOrderRequest = {
        merchantId: initSheet.merchant.id,
        currencyCode: order.currencyCode,
        cart: order.cart,
        metadata: order.metadata || initSheet.metadata,
    };

    if (address) {
        payload.shippingAddressId = address.id;
    }

    if (paymentMethodType === PaymentMethodType.Cash) {
        payload.paymentMethod = {
            methodType: 'CASH_ON_DELIVERY',
        };
    }

    if (paymentMethodType === 'CARD' && paymentMethod) {
        payload.paymentMethod = {
            methodType: 'CARD',
            cardLast4: paymentMethod.lastDigits,
            cardNetwork: paymentMethod.system.toUpperCase(),
        };
    }
    if (shippingContact) {
        payload.shippingContactId = shippingContact.id;
    }

    if (billingContact) {
        payload.billingContact = billingContact;
    }

    if (courierOption) {
        payload.shippingMethod = {
            methodType: 'COURIER',
            courierOption: courierOption,
        };

        payload.orderAmount = getTotalAmount(order, courierOption.amount);
    } else if (pickupOption) {
        payload.shippingMethod = {
            methodType: 'PICKUP',
            pickupOption: pickupOption,
        };

        payload.orderAmount = getTotalAmount(order, pickupOption.amount);
    } else {
        payload.orderAmount = getTotalAmount(order);
    }

    return payload;
}
