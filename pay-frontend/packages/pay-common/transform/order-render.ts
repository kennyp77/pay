import pathOr from '@tinkoff/utils/object/pathOr';
import {
    CouponStatus,
    RenderOrderRequest,
    RenderOrderResponse,
    ShippingCourierOption,
    ShippingPickupOption,
} from '@trust/pay-api';
import { diffAmount, sumAmount, mulAmount } from '@trust/utils/math/amount';
import {
    CurrencyCode,
    OrderItemType,
    AllowedAuthMethod,
    AllowedCardNetwork,
    CountryCode,
    PaymentMethodType,
} from '@yandex-pay/sdk/src/typings';

type SippingOptions = {
    courier?: ShippingCourierOption;
    pickup?: ShippingPickupOption;
};

const COUPON_ID = '__coupon_pay';
const DISCOUNT_ID = '__discount_pay';
const SHIPPING_ID = '__shipping_pay';

const getOrderItems = (order: RenderOrderResponse): Sdk.OrderItem[] => {
    const { items } = order.cart;

    return items.map((item) => ({
        id: item.productId,
        label: item.title,
        amount: item.subtotal || item.total,
        quantity: item.quantity,
    }));
};

const getOrderItemsTotalAmounts = (order: RenderOrderResponse): Sdk.Price[] => {
    return order.cart.total
        ? [order.cart.total.amount]
        : order.cart.items.map((item) => item.total);
};

const getDiscountsItems = (order: RenderOrderResponse): Sdk.OrderItem[] => {
    const { discounts = [] } = order.cart;

    return discounts.map(({ amount, description }) => ({
        id: DISCOUNT_ID,
        type: OrderItemType.Discount,
        amount,
        label: description,
    }));
};

const getCouponItems = (order: RenderOrderResponse): Sdk.OrderItem[] => {
    const { items, coupons = [] } = order.cart;

    const couponDiscount = items
        .filter((item) => item.subtotal)
        .reduce(
            (total, item) => sumAmount(total, diffAmount(item.subtotal as string, item.total)),
            '0.00',
        );

    if (couponDiscount === '0.00') {
        return [];
    }

    const coupon = coupons.find((coupon) => coupon.status === 'VALID');

    return [
        {
            id: COUPON_ID,
            type: OrderItemType.Discount,
            amount: mulAmount('-1', couponDiscount),
            label: coupon ? coupon.description : 'Скидка',
        },
    ];
};

const getShippingOrderItems = (shippingOption: SippingOptions): Sdk.OrderItem[] => {
    const option = shippingOption.courier || shippingOption.pickup;

    if (!option) {
        return [];
    }

    return [
        {
            id: SHIPPING_ID,
            type: OrderItemType.Shipping,
            amount: String(option.amount),
            label: shippingOption.courier
                ? `Доставка ${shippingOption.courier.title}`
                : `Самовывоз ${shippingOption.pickup?.title}`,
        },
    ];
};

const getPaymentSheetOrder = (
    order: RenderOrderResponse,
    shippingOption: SippingOptions,
): Sdk.Order => {
    const shippingOrderItems = getShippingOrderItems(shippingOption);

    const items: Sdk.OrderItem[] = [
        ...getOrderItems(order),
        ...shippingOrderItems,
        ...getDiscountsItems(order),
        ...getCouponItems(order),
    ];

    const totalAmount = sumAmount(
        ...getOrderItemsTotalAmounts(order),
        ...shippingOrderItems.map((item) => item.amount),
    );

    return {
        id: order.cart.externalId || order.cart.cartId || '',
        items,
        total: {
            amount: totalAmount,
            label: order.cart?.total?.label || '',
        },
    };
};

const getPaymentMethods = (order: RenderOrderResponse): Sdk.PaymentMethod[] => {
    const { availablePaymentMethods = [] } = order;
    const paymentMethods: Sdk.PaymentMethod[] = [];

    if (availablePaymentMethods.includes('CARD')) {
        paymentMethods.push({
            type: PaymentMethodType.Card,
            gateway: 'payture',
            gatewayMerchantId: 'payture-merchant-id',
            allowedAuthMethods: [AllowedAuthMethod.PanOnly],
            allowedCardNetworks: [
                AllowedCardNetwork.Visa,
                AllowedCardNetwork.Mastercard,
                AllowedCardNetwork.Mir,
                AllowedCardNetwork.Uzcard,
            ],
        });
    }

    if (
        availablePaymentMethods.includes('CASH_ON_DELIVERY') ||
        availablePaymentMethods.includes('CARD_ON_DELIVERY')
    ) {
        paymentMethods.push({
            type: PaymentMethodType.Cash,
        });
    }

    if (availablePaymentMethods.includes('SPLIT')) {
        paymentMethods.push({
            type: PaymentMethodType.Split,
        });
    }

    return paymentMethods;
};

export const orderToPaymentSheet = (
    initSheet: Sdk.InitPaymentSheet,
    order: RenderOrderResponse,
    shippingOption: SippingOptions,
): Sdk.PaymentSheet => {
    const { requiredFields, shipping } = order;

    return {
        version: 2,
        merchant: {
            id: initSheet.merchant.id,
            name: initSheet.merchant.name,
        },
        currencyCode: order.currencyCode as CurrencyCode,
        countryCode: CountryCode.Ru,
        requiredFields: {
            billingContact: {
                name: Boolean(requiredFields?.billingContact?.name),
                email: Boolean(requiredFields?.billingContact?.email),
            },
            shippingContact: {
                name: Boolean(requiredFields?.shippingContact?.name),
                email: Boolean(requiredFields?.shippingContact?.email),
                phone: Boolean(requiredFields?.shippingContact?.phone),
            },
            shippingTypes: {
                direct: Boolean(
                    shipping?.availableMethods.includes('COURIER') ||
                        shipping?.availableMethods.includes('YANDEX_DELIVERY'),
                ),
                pickup: Boolean(shipping?.availableMethods.includes('PICKUP')),
            },
        },
        additionalFields: {
            coupons: Boolean(order.enableCoupons),
            comment: Boolean(order.enableCommentField),
        },
        order: getPaymentSheetOrder(order, shippingOption),
        paymentMethods: getPaymentMethods(order),
    };
};

export function paymentSheetToOrder({
    initSheet,
    address,
    coupon,
}: {
    initSheet: Sdk.InitPaymentSheet;
    address?: Checkout.Address;
    coupon?: Checkout.Coupon;
}): RenderOrderRequest {
    const payload: RenderOrderRequest = {
        merchantId: initSheet.merchant.id,
        currencyCode: initSheet.currencyCode,
        cart: {
            externalId: initSheet.order.id,
            items: initSheet.order.items.map((item) => ({
                productId: item.id,
                quantity: {
                    count: pathOr(['quantity', 'count'], '1', item),
                },
            })),
        },
        metadata: initSheet.metadata,
    };

    if (address) {
        payload.shippingAddressId = address.id;
    }

    if (coupon) {
        payload.cart.coupons = [{ value: coupon }];
    }

    return payload;
}

export function couponStatus(
    couponValue: string,
    order: RenderOrderResponse,
): [CouponStatus, string] {
    const coupon = order.cart.coupons?.find((item) => (item.value = couponValue));

    return coupon ? [coupon.status, coupon.description] : ['INVALID', 'Некорретный промокод'];
}
