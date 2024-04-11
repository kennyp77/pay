import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { RenderOrderResponse, ShippingCourierOption, ShippingPickupOption } from '@trust/pay-api';
import * as payApi from '@trust/pay-api';
import { PaymentMethodType } from '@trust/utils/payment-methods/typings';
import { onReject } from '@trust/utils/promise/on-reject';

import {
    couponStatus,
    orderToPaymentSheet,
    orderToShippingOptions,
    pickupOptionsToPickupPoints,
    paymentSheetToOrder,
    paymentSheetToOrderCreate,
} from '../transform';

type CreateOrderArgs = {
    paymentMethodType: PaymentMethodType;
    paymentMethod?: Checkout.PaymentMethod;
    billingContact?: Checkout.BillingContact;
    shippingContact?: Checkout.CheckoutShippingMethodContactData;
};

interface CreateOrderResponse {
    checkoutOrderId: string;
    orderId: string;
    metadata?: string;
}

export const API = {
    checkout: payApi.checkout,
    renderOrder: payApi.renderOrder,
    createOrder: payApi.createOrder,
    loadPickupOptions: payApi.loadPickupOptions,
    loadPickupOptionDetails: payApi.loadPickupOptionDetails,
    createTransaction: payApi.createTransaction,
    getTransactionStatus: payApi.getTransactionStatus,
};

export class ServerApiModule {
    static getInstance = memoizeOnce((): ServerApiModule => {
        return new ServerApiModule();
    });

    static setApiHandleError(handleErrorFn: (...args: any) => any) {
        Object.keys(API).forEach((key: keyof typeof API) => {
            /* @ts-ignore */
            API[key] = onReject(handleErrorFn, API[key]);
        });
    }

    private lastRender: RenderOrderResponse;

    private initSheet: Sdk.InitPaymentSheet;
    private address?: Checkout.Address;
    private coupon?: Checkout.Coupon;

    private courierOption?: ShippingCourierOption;
    private pickupOption?: ShippingPickupOption;

    private constructor() {}

    private async renderOrder() {
        const res = await API.renderOrder(
            paymentSheetToOrder({
                initSheet: this.initSheet,
                address: this.address,
                coupon: this.coupon,
            }),
        );

        this.lastRender = res.data.order;

        // NB: Обновляем метадату на последнюю отданную
        if (this.lastRender.metadata) {
            this.initSheet.metadata = this.lastRender.metadata;
        }

        return this.lastRender;
    }

    private getPaymentSheet() {
        return orderToPaymentSheet(this.initSheet, this.lastRender, {
            pickup: this.pickupOption,
            courier: this.courierOption,
        });
    }

    async waitSheet(waitTimeout: number, initSheet: Sdk.InitPaymentSheet) {
        this.initSheet = initSheet;

        await this.renderOrder();

        return this.getPaymentSheet();
    }

    setup() {
        /* @ts-ignore */
        return { pickupPoints: undefined };
    }

    async shippingAddressChange(address: Checkout.Address) {
        this.address = address;

        await this.renderOrder();

        return { shippingOptions: orderToShippingOptions(this.lastRender) };
    }

    shippingOptionChange(shippingOption: Sdk.ShippingOption) {
        this.pickupOption = undefined;
        this.courierOption = shippingOption.raw as ShippingCourierOption;

        return this.getPaymentSheet();
    }

    async pickupBoundsChange(bounds: Sdk.GeoBounds, center: Sdk.GeoPoint) {
        const order = paymentSheetToOrder({
            initSheet: this.initSheet,
        });

        const res = await API.loadPickupOptions({
            merchantId: order.merchantId,
            cart: order.cart,
            boundingBox: bounds,
            metadata: order.metadata,
            currencyCode: order.currencyCode,
        });

        const pickupPoints = pickupOptionsToPickupPoints(res.data.pickupOptions);

        return { pickupPoints };
    }

    async pickupInfoRequest({ pickupPointId }: Sdk.PickupInfo) {
        const order = paymentSheetToOrder({
            initSheet: this.initSheet,
        });

        const res = await API.loadPickupOptionDetails({
            merchantId: order.merchantId,
            cart: order.cart,
            pickupPointId,
            metadata: order.metadata,
            currencyCode: order.currencyCode,
        });

        const [pickupPoint] = pickupOptionsToPickupPoints([res.data.pickupOption]);

        return { pickupPoint };
    }

    async pickupPointChange(pickupPoint: Sdk.PickupPoint) {
        this.courierOption = undefined;
        this.pickupOption = pickupPoint.raw as ShippingPickupOption;

        return this.getPaymentSheet();
    }

    async shippingOptionReset() {
        this.courierOption = undefined;

        return this.getPaymentSheet();
    }

    async couponChange(coupon: Checkout.Coupon) {
        this.coupon = coupon;

        const order = await this.renderOrder();

        const [status, description] = couponStatus(coupon, order);

        if (status === 'EXPIRED' || status === 'INVALID') {
            return Promise.reject(description);
        }

        return this.getPaymentSheet();
    }

    async couponReset() {
        this.coupon = undefined;

        await this.renderOrder();

        return this.getPaymentSheet();
    }

    async createOrder({
        paymentMethodType,
        paymentMethod,
        shippingContact,
        billingContact,
    }: CreateOrderArgs): Promise<CreateOrderResponse> {
        const res = await API.createOrder(
            paymentSheetToOrderCreate({
                initSheet: this.initSheet,
                order: this.lastRender,
                address: this.address,
                pickupOption: this.pickupOption,
                courierOption: this.courierOption,
                paymentMethodType,
                paymentMethod,
                shippingContact,
                billingContact,
            }),
        );

        const { checkoutOrderId, orderId, metadata } = res.data.order;

        return { checkoutOrderId, orderId, metadata };
    }
}
