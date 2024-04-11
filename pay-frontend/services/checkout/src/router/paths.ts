import { generatePath } from 'react-router';

import { BASE_ROUTE } from '../config';

export type PathObj = {
    pathname: string;
    search?: string;
};

export class Path {
    static routeMain = BASE_ROUTE;
    static routeAddresses = `${BASE_ROUTE}/addresses`;
    static routeAddressesAdd = `${BASE_ROUTE}/addresses/add`;
    static routeAddressesEdit = `${BASE_ROUTE}/addresses/:id/edit`;
    static routeContacts = `${BASE_ROUTE}/contacts`;
    static routeContactsAdd = `${BASE_ROUTE}/contacts/add`;
    static routeContactsEdit = `${BASE_ROUTE}/contacts/:id/edit`;
    static routePaymentMethods = `${BASE_ROUTE}/payment-methods`;
    static routePaymentMethodsAddCard = `${BASE_ROUTE}/payment-methods/add`;
    static routePaymentMethodsSplitAddCard = `${BASE_ROUTE}/payment-methods-split/add`;
    static routePickup = `${BASE_ROUTE}/pickup`;
    static routePickupSelected = `${BASE_ROUTE}/pickup/selected`;
    static routeDirectShipping = `${BASE_ROUTE}/shipping`;
    static routeCoupon = `${BASE_ROUTE}/coupon/add`;
    static routeCouponSelected = `${BASE_ROUTE}/coupon`;
    static routeShippingType = `${BASE_ROUTE}/shipping/type`;
    static routeSplitPayment = `${BASE_ROUTE}/split/payment`;
    static routeAboutSplit = `${BASE_ROUTE}/about/split`;
    static routeAboutSplitPlus = `${BASE_ROUTE}/about/split-plus`;
    static routeCheckout = `${BASE_ROUTE}/process`;

    static get Main(): string {
        return `${Path.routeMain}${location.search}`;
    }

    static get Addresses() {
        return `${Path.routeAddresses}${location.search}`;
    }

    static get AddressesAdd() {
        return `${Path.routeAddressesAdd}${location.search}`;
    }

    static AddressesEdit(params: Record<string, any>) {
        return `${generatePath(Path.routeAddressesEdit, params)}${location.search}`;
    }

    static get Contacts() {
        return `${Path.routeContacts}${location.search}`;
    }

    static get ContactsAdd() {
        return `${Path.routeContactsAdd}${location.search}`;
    }

    static ContactsEdit(params: Record<string, any>) {
        return `${generatePath(Path.routeContactsEdit, params)}${location.search}`;
    }

    static get PaymentMethods() {
        return `${Path.routePaymentMethods}${location.search}`;
    }

    static get PaymentMethodsAddCard() {
        return `${Path.routePaymentMethodsAddCard}${location.search}`;
    }

    static get PaymentMethodsSplitAddCard() {
        return `${Path.routePaymentMethodsSplitAddCard}${location.search}`;
    }

    static get Pickup() {
        return `${Path.routePickup}${location.search}`;
    }

    static get PickupSelected() {
        return `${Path.routePickupSelected}${location.search}`;
    }

    static get DirectShipping() {
        return `${Path.routeDirectShipping}${location.search}`;
    }

    static get Coupon() {
        return `${Path.routeCoupon}${location.search}`;
    }

    static get CouponSelected() {
        return `${Path.routeCouponSelected}${location.search}`;
    }

    static get ShippingType() {
        return `${Path.routeShippingType}${location.search}`;
    }

    static get SplitPayment() {
        return `${Path.routeSplitPayment}${location.search}`;
    }

    static get AboutSplit() {
        return `${Path.routeAboutSplit}${location.search}`;
    }

    static get AboutSplitPlus() {
        return `${Path.routeAboutSplitPlus}${location.search}`;
    }

    static get Checkout() {
        return `${Path.routeCheckout}${location.search}`;
    }
}
