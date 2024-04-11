import {
    getOrderAmount,
    getRequiredShippingTypes,
    getRequiredBillingFields,
    getRequiredShippingContactFields,
} from '@trust/utils/payment-sheet';
import { createSelector } from 'reselect';

import { toShippingAddress, toShippingMethodDataAddress } from '../../api-transform/addresses';
import { logContacts } from '../../helpers/log';
import { CASH_KEY } from '../../helpers/payment-method';
import { ShippingType } from '../../typings';
import { getSelectedAddressId, getSelectedAddress } from '../addresses';
import { getSelectedContactId, getSelectedContact, getContactList } from '../contacts';
import { getEmail, getSheet } from '../payment';
import { getActivePaymentId, getActivePaymentMethod } from '../payment-methods';
import { getPickupSelectedPoint, getPickupSelectedPointId } from '../pickup';
import {
    getSelectedShippingOptionId,
    getSelectedShippingOption,
    isShippingOptionsDisabled,
    getShippingType,
} from '../shipping';
import { hasSplitPlan } from '../split';

export const isSplitAvailable = createSelector(
    getActivePaymentId,
    hasSplitPlan,
    (paymentMethodId, hasSplit) => {
        return !hasSplit || paymentMethodId === CASH_KEY;
    },
);

export const isCheckoutAvailable = createSelector(
    getSelectedAddressId,
    getPickupSelectedPointId,
    getSelectedContactId,
    getActivePaymentId,
    getSelectedShippingOptionId,
    isShippingOptionsDisabled,
    getShippingType,
    (
        addressId,
        pickupId,
        contactId,
        paymentMethodId,
        shippingOptionId,
        shippingOptionDisabled,
        shippingType,
    ) => {
        if (contactId && paymentMethodId) {
            if (shippingType === ShippingType.Direct && addressId) {
                if (shippingOptionId || shippingOptionDisabled) {
                    return true;
                }
            } else if (shippingType === ShippingType.Pickup && pickupId) {
                return true;
            }
        }

        return false;
    },
);

export const getBillingContact = createSelector(getSheet, getEmail, (paymentSheet, userEmail) => {
    const billingFields = getRequiredBillingFields(paymentSheet);

    const billingContact: Checkout.BillingContact = {};

    if (billingFields && billingFields.email) {
        billingContact.email = userEmail;
    }

    return billingContact;
});

type CheckoutData = Omit<Sdk.ProcessEventData, 'token' | 'paymentMethodInfo'>;

export const getCheckoutData = createSelector(
    getContactList,
    getSelectedContactId,
    getSheet,
    getBillingContact,
    getSelectedAddress,
    getSelectedContact,
    getActivePaymentMethod,
    getSelectedShippingOption,
    getPickupSelectedPoint,
    getShippingType,
    (
        contactsList,
        contactId,
        paymentSheet,
        billingContact,
        address,
        contact,
        paymentMethod,
        shippingOption,
        pickupPoint,
        shippingType,
    ): CheckoutData => {
        const shippingContactFields = getRequiredShippingContactFields(paymentSheet);
        const shippingTypes = getRequiredShippingTypes(paymentSheet);

        const checkoutData: CheckoutData = {
            orderAmount: getOrderAmount(paymentSheet),
            billingContact,
        };

        logContacts('getCheckoutData', contactsList, contactId, contact);

        if (shippingContactFields && contact) {
            checkoutData.shippingContact = {
                firstName: contact.firstName,
                secondName: contact.secondName,
                lastName: contact.lastName,
                email: contact.email,
            };

            if (shippingContactFields.phone) {
                checkoutData.shippingContact.phone = contact.phoneNumber;
            }
        }

        if (shippingType === ShippingType.Direct) {
            if (shippingTypes && shippingTypes.direct && address) {
                checkoutData.shippingMethodInfo = {
                    type: shippingType,
                    shippingAddress: toShippingAddress(address),
                };

                if (shippingOption) {
                    checkoutData.shippingMethodInfo.shippingOption = shippingOption;
                }
            }
        } else if (shippingType === ShippingType.Pickup) {
            if (shippingTypes && shippingTypes.pickup && pickupPoint) {
                checkoutData.shippingMethodInfo = {
                    type: shippingType,
                    pickupPoint,
                };
            }
        }

        return checkoutData;
    },
);

export const getShippingMethodData = createSelector(
    getSheet,
    getSelectedAddress,
    getSelectedShippingOption,
    getPickupSelectedPoint,
    getShippingType,
    (
        paymentSheet,
        address,
        shippingOption,
        pickupPoint,
        shippingType,
    ): Checkout.CheckoutShippingMethodData | undefined => {
        const shippingTypes = getRequiredShippingTypes(paymentSheet);

        if (!shippingTypes || (!shippingTypes.direct && !shippingTypes.pickup)) {
            return undefined;
        }

        const shippingData: Checkout.CheckoutShippingMethodData = {
            type: shippingType,
        };

        if (shippingType === ShippingType.Direct) {
            if (shippingTypes && shippingTypes.direct && address) {
                shippingData.direct = {
                    address: toShippingMethodDataAddress(address),
                };

                if (shippingOption) {
                    shippingData.direct = {
                        ...shippingData.direct,
                        id: shippingOption.id,
                        provider: shippingOption.provider,
                        category: shippingOption.category,
                        amount: shippingOption.amount,
                    };
                }
            }
        } else if (shippingType === ShippingType.Pickup) {
            if (shippingTypes && shippingTypes.pickup && pickupPoint) {
                shippingData.pickup = {
                    id: pickupPoint.id,
                    provider: pickupPoint.provider,
                    amount: pickupPoint.amount || '0',
                    address: {
                        formatted: pickupPoint.address,
                        location: pickupPoint.coordinates,
                    },
                };
            }
        }

        return shippingData;
    },
);

export const getShippingMethodContactData = createSelector(
    getSheet,
    getSelectedContact,
    (paymentSheet, contact): Checkout.CheckoutShippingMethodContactData | undefined => {
        const shippingContactFields = getRequiredShippingContactFields(paymentSheet);

        if (shippingContactFields && contact) {
            return { id: contact.id };
        }

        return undefined;
    },
);
