import clone from '@tinkoff/utils/clone';
import * as Sdk from '@yandex-pay/sdk/src/typings';
import { OrderItemType } from '@yandex-pay/sdk/src/typings';

import { amountSum } from './amount';

export class Cart {
    private id: Sdk.OrderId;
    private items: Sdk.OrderItem[];
    private deliveryItem: null | Sdk.OrderItem = null;
    private discountItem: null | Sdk.OrderItem = null;

    static fromItems(items: Sdk.OrderItem[], id: Sdk.OrderId) {
        return new Cart(items, id);
    }

    static fromOrder(order: Sdk.Order) {
        return new Cart(order.items || [], order.id);
    }

    private constructor(items: Sdk.OrderItem[], id: Sdk.OrderId) {
        this.id = `${id}-${Math.round(Math.random() * 1000)}`;
        this.items = clone(items);
    }

    setShipping(shippingOption: Sdk.ShippingOption) {
        this.deliveryItem = {
            id: shippingOption.id,
            type: OrderItemType.Shipping,
            label: shippingOption.label || 'Доставка',
            amount: shippingOption.amount,
        };
    }

    setPickup(pickupPoint: Sdk.PickupPoint) {
        this.deliveryItem = {
            id: pickupPoint.id,
            type: OrderItemType.Pickup,
            label: pickupPoint.label || 'Самовывоз',
            amount: pickupPoint.amount as string,
        };
    }

    setPromocode(amount: Sdk.Price) {
        this.discountItem = {
            id: 'discount',
            type: OrderItemType.Promocode,
            label: 'Промокод',
            amount,
        };
    }

    resetPromocode() {
        this.discountItem = null;
    }

    resetShipping() {
        this.deliveryItem = null;
    }

    resetAdditionals() {
        this.resetShipping();
        this.resetPromocode();
    }

    getAllItems() {
        return this.items.concat(this.deliveryItem || [], this.discountItem || []);
    }

    getTotalAmount(): Sdk.Price {
        const items = this.getAllItems();

        return items.reduce((sum, item) => amountSum(sum, item.amount), '0');
    }

    getOrder(): Sdk.Order {
        return {
            id: this.id,
            items: this.getAllItems(),
            total: {
                label: 'Итого',
                amount: this.getTotalAmount(),
            },
        };
    }
}
