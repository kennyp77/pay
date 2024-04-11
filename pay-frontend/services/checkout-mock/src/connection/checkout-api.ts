import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import pathOr from '@tinkoff/utils/object/pathOr';
import {
    ShippingOption,
    PickupBounds,
    PickupPoint,
    Order,
    MerchantErrors,
    InitPaymentSheet,
    PaymentSheet,
    CurrencyCode,
    CountryCode,
} from '@yandex-pay/sdk/src/typings';

import * as api from '../api';
import { USER_EMAIL } from '../config';
import { Address, Contact, UserCard } from '../typings';

const toUnixTS = (val: string) => Math.floor(new Date(val).getTime() * 0.001);

const sumAmount = (amountA: string, amountB: string) =>
    (Number(amountA) + Number(amountB)).toFixed(2);

function toOrderRenderPayload(data: CheckoutApi): any {
    const order: any = {
        merchantId: data.sheet.merchant.id,
        currencyCode: 'RUB',
        cart: {
            externalId: data.sheet.order.id,
            items: data.sheet.order.items.map((item: any) => ({
                product_id: item.id,
                quantity: {
                    count: pathOr(['quantity', 'count'], '1', item),
                },
            })),
        },
        metadata: data.sheet.metadata,
    };

    if (data.address) {
        order.shippingAddressId = data.address.id;
    }

    return order;
}

function toOrderCreatePayload(data: CheckoutApi, lastOrder: any): any {
    const order: any = {
        merchantId: data.sheet.merchant.id,
        currencyCode: 'RUB',
        cart: lastOrder.cart,
        metadata: data.sheet.metadata,
        orderAmount: lastOrder.cart.total.amount,
        billingContact: {
            email: USER_EMAIL,
        },
    };

    if (data.address) {
        order.shippingAddressId = data.address.id;
    }

    if (data.card) {
        order.paymentMethod = {
            methodType: 'CARD',
            cardLast4: data.card.cardLast4,
            cardNetwork: data.card.cardNetwork,
        };
    }

    if (data.shippingContact) {
        order.shippingContactId = data.shippingContact.id;
    }

    if (data.shippingOption) {
        const courierOption = pathOr(['shipping', 'availableCourierOptions'], [], lastOrder).find(
            (item: any) => item.courierOptionId === data.shippingOption.id,
        );

        order.shippingMethod = {
            methodType: 'COURIER',
            courierOption,
        };

        order.orderAmount = sumAmount(lastOrder.cart.total.amount, courierOption.amount);
    }

    return order;
}

function orderToPaymentSheet(order: any): PaymentSheet {
    return {
        version: 2,
        merchant: {
            id: order.merchantId,
            name: '',
        },
        currencyCode: CurrencyCode.Rub,
        countryCode: CountryCode.Ru,
        requiredFields: {
            ...(order.requiredFields || {}),
            shippingTypes: {
                direct: pathOr(['shipping', 'availableMethods'], [], order).includes('COURIER'),
                pickup: pathOr(['shipping', 'availableMethods'], [], order).includes('PICKUP'),
            },
        },
        order: {
            id: order.cart.cartId,
            total: {
                amount: order.cart.total.amount,
                label: 'Total',
            },
            items: order.cart.items.map((item: any) => ({
                id: item.productId,
                amount: item.unitPrice,
                label: item.title,
            })),
        },
        paymentMethods: [],
    };
}

function orderToShippingOptions(order: any): ShippingOption[] {
    return pathOr(['shipping', 'availableCourierOptions'], [], order).map((item: any) => {
        return {
            id: item.courierOptionId,
            provider: item.provider,
            category: item.category,
            amount: item.amount,
            date: toUnixTS(item.fromDate),
            label: item.label,
        };
    });
}

export class CheckoutApi {
    static getInstance = memoizeOnce((): CheckoutApi => {
        return new CheckoutApi();
    });

    private lastRender: any;

    public sheet: InitPaymentSheet;
    public address: Address;
    public card: UserCard;
    public shippingContact: Contact;
    public shippingOption: ShippingOption;
    public pickupOption: PickupPoint;

    private constructor() {}

    async initial(sheet: InitPaymentSheet): Promise<PaymentSheet> {
        this.sheet = sheet;
        this.lastRender = await api.renderOrder(toOrderRenderPayload(this));

        return orderToPaymentSheet(this.lastRender.data.order);
    }

    async shippingAddressChange(shippingAddress: Address): Promise<{
        shippingOptions: ShippingOption[];
        errors?: MerchantErrors[];
    }> {
        this.address = shippingAddress;
        this.lastRender = await api.renderOrder(toOrderRenderPayload(this));

        return {
            shippingOptions: orderToShippingOptions(this.lastRender.data.order),
        };
    }

    async shippingOptionChange(shippingOption: ShippingOption): Promise<{
        order: Order;
        errors?: MerchantErrors[];
    }> {
        this.pickupOption = undefined;
        this.shippingOption = shippingOption;

        return { order: this.lastRender.data.order };
    }

    pickupBoundsChange(pickupBounds: PickupBounds): Promise<{
        pickupPoints: PickupPoint[];
        errors?: MerchantErrors[];
    }> {
        return Promise.resolve({ pickupPoints: [] });
    }

    async pickupPointChange(pickupPoint: PickupPoint): Promise<{
        order: Order;
        errors?: MerchantErrors[];
    }> {
        this.shippingOption = undefined;
        this.pickupOption = pickupPoint;

        return { order: this.lastRender.data.order };
    }

    async createOrder(card: UserCard, shippingContact: Contact): Promise<any> {
        this.card = card;
        this.shippingContact = shippingContact;
        this.lastRender = await api.createOrder(
            toOrderCreatePayload(this, this.lastRender.data.order),
        );

        return this.lastRender.data.order;
    }
}
