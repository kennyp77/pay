import React from 'react';

import { counters } from '../counters';
import { withLifecycleTracking } from '../hocs/withLifecycleTracking';
import { AboutSplitPage } from '../pages/about-split';
import { AboutSplitPlusPage } from '../pages/about-split-plus';
import { AddressesPage } from '../pages/addresses';
import { AddressesAddPage } from '../pages/addresses-add';
import { AddressesEditsPage } from '../pages/addresses-edit';
import { ContactsPage } from '../pages/contacts';
import { ContactsAddPage } from '../pages/contacts-add';
import { ContactsEditPage } from '../pages/contacts-edit';
import { CouponPage } from '../pages/coupon';
import { CouponSelectedPage } from '../pages/coupon-selected';
import { DirectShippingPage } from '../pages/direct-shipping';
import { MainPage } from '../pages/main';
import { PaymentAddCardPage } from '../pages/payment-add-card';
import { PaymentMethodsPage } from '../pages/payment-methods';
import { PickupPage } from '../pages/pickup-page';
import { PickupSelectedPage } from '../pages/pickup-selected';

import { Path } from './paths';

export const obRoutes: Checkout.Routes = [
    {
        path: Path.routeAddresses,
        component: withLifecycleTracking(AddressesPage, {
            onEnter: counters.screenEnterObAddresses,
            onLeave: counters.screenLeaveObAddresses,
        }),
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
    {
        path: Path.routeAddressesAdd,
        component: withLifecycleTracking(AddressesAddPage, {
            onEnter: counters.screenEnterObAddressesAdd,
            onLeave: counters.screenLeaveObAddressesAdd,
        }),
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
    {
        path: Path.routeAddressesEdit,
        component: withLifecycleTracking(AddressesEditsPage, {
            onEnter: counters.screenEnterObAddressesEdit,
            onLeave: counters.screenLeaveObAddressesEdit,
        }),
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
    {
        path: Path.routeContactsAdd,
        component: withLifecycleTracking(ContactsAddPage, {
            onEnter: counters.screenEnterObContacts,
            onLeave: counters.screenLeaveObContacts,
        }),
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
    {
        path: Path.routeContactsEdit,
        component: withLifecycleTracking(ContactsEditPage, {
            onEnter: counters.screenEnterObContacts,
            onLeave: counters.screenLeaveObContacts,
        }),
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
    {
        path: Path.routeContacts,
        component: withLifecycleTracking(ContactsPage, {
            onEnter: counters.screenEnterObContacts,
            onLeave: counters.screenLeaveObContacts,
        }),
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
    {
        path: Path.routePickup,
        component: withLifecycleTracking(PickupPage, {
            onEnter: counters.screenEnterObPickupPage,
            onLeave: counters.screenLeaveObPickupPage,
        }),
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
    {
        path: Path.routePickupSelected,
        component: PickupSelectedPage,
        componentProps: {
            touch: true,
            obRoute: true,
        },
    },
];

export const routes: Checkout.Routes = [
    {
        path: Path.routePickup,
        component: withLifecycleTracking(PickupPage, {
            onEnter: counters.screenEnterPickupPage,
            onLeave: counters.screenLeavePickupPage,
        }),
        componentProps: {
            touch: true,
        },
    },
    {
        path: Path.routePickupSelected,
        component: PickupSelectedPage,
        componentProps: { touch: true },
    },
    {
        path: '*',
        component: withLifecycleTracking(MainPage, { onEnter: counters.screenEnterMain }),
        componentProps: { touch: true },
        routes: [
            {
                path: Path.routeAddressesAdd,
                component: withLifecycleTracking(AddressesAddPage, {
                    onEnter: counters.screenEnterAddressesAdd,
                    onLeave: counters.screenLeaveAddressesAdd,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeAddressesEdit,
                component: withLifecycleTracking(AddressesEditsPage, {
                    onEnter: counters.screenEnterAddressesEdit,
                    onLeave: counters.screenLeaveAddressesEdit,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeAddresses,
                component: withLifecycleTracking(AddressesPage, {
                    onEnter: counters.screenEnterAddresses,
                    onLeave: counters.screenLeaveAddresses,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeContactsAdd,
                component: withLifecycleTracking(ContactsAddPage, {
                    onEnter: counters.screenEnterContacts,
                    onLeave: counters.screenLeaveContacts,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeContactsEdit,
                component: withLifecycleTracking(ContactsEditPage, {
                    onEnter: counters.screenEnterContacts,
                    onLeave: counters.screenLeaveContacts,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeContacts,
                component: withLifecycleTracking(ContactsPage, {
                    onEnter: counters.screenEnterContacts,
                    onLeave: counters.screenLeaveContacts,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routePaymentMethods,
                component: withLifecycleTracking(PaymentMethodsPage, {
                    onEnter: counters.screenEnterPaymentMethod,
                    onLeave: counters.screenLeavePaymentMethod,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeDirectShipping,
                component: withLifecycleTracking(DirectShippingPage, {
                    onEnter: counters.screenEnterShippingOption,
                    onLeave: counters.screenLeaveShippingOption,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routePaymentMethodsAddCard,
                component: PaymentAddCardPage,
                componentProps: { touch: true },
            },
            {
                path: Path.routePickup,
                component: PickupPage,
                componentProps: { touch: true },
            },
            {
                path: Path.routeCoupon,
                component: withLifecycleTracking(CouponPage, {
                    onEnter: counters.screenEnterCoupon,
                    onLeave: counters.screenLeaveCoupon,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeCouponSelected,
                component: withLifecycleTracking(CouponSelectedPage, {
                    onEnter: counters.screenEnterCouponSelected,
                    onLeave: counters.screenLeaveCouponSelected,
                }),
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeAboutSplit,
                component: AboutSplitPage,
                componentProps: {
                    touch: true,
                },
            },
            {
                path: Path.routeAboutSplitPlus,
                component: AboutSplitPlusPage,
                componentProps: {
                    touch: true,
                },
            },
        ],
    },
];
