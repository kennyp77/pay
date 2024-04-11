import { CardPaymentMethod } from '@trust/utils/payment-methods/typings';
import type * as sdk from '@yandex-pay/sdk/src/typings';
import type { RouteProps, RouteComponentProps } from 'react-router-dom';

import { ShippingType } from '.';

interface ObStep {
    step: number;
    prevHref?: string;
    addPrevHref?: string;
    completeHref: string;
}

interface ObContactStep extends ObStep {
    addFillForm?: boolean;
}

declare global {
    namespace Checkout {
        // Роутинг

        type Route = RouteProps & {
            componentProps?: Record<string, any>;
            routes?: Route[];
        };

        type Routes = Route[];

        interface PageProps<T = {}> extends RouteComponentProps<T> {
            touch?: boolean;
            obRoute?: boolean;
        }

        interface ObSteps {
            active: boolean;
            addressOnboarded: boolean;
            contactOnboarded: boolean;
            pickupOnboarded: boolean;
            startHref: string | { pathname: string; search?: string };
            totalSteps: number;
            address: ObStep;
            contact: ObContactStep;
        }

        // Пользовательские данные

        type ContactId = string;

        interface Contact {
            id: ContactId;
            ownerService: string;
            firstName: string;
            lastName: string;
            secondName: string;
            email: string;
            phoneNumber: string;
        }

        interface ContactFormData {
            firstName: string;
            lastName: string;
            secondName: string;
            phoneNumber: string;
            email: string;
        }

        type AddressId = string;

        interface AddressLocation {
            longitude: number;
            latitude: number;
        }

        interface Address {
            id: AddressId;
            ownerService: string;
            type: string;
            zip: string;
            country: string;
            region: string;
            locality: string;
            street: string;
            building: string;
            room: string;
            entrance: string;
            floor: string;
            intercom: string;
            comment: string;
            location: AddressLocation;
        }

        interface AddressFormData {
            address: string;
            room: string;
            entrance: string;
            floor: string;
            intercom: string;
            comment: string;
        }

        type SearchAddressQuery = string;
        type SearchAddressSuggest = string;

        type TrustCardId = string;
        type CardId = string;
        type PaymentMethodId = string;
        type PaymentMethod = CardPaymentMethod;

        interface UserState {
            contactId: string;
            cardId: string;
            addressId: string;
            isCheckoutOnboarded: boolean;
        }

        type PickupPoint = sdk.PickupPoint;

        interface ShippingMethodDataAddress {
            id: AddressId;
            country: string;
            region: string;
            locality: string;
        }

        interface ShippingMethodDataPickupAddress {
            formatted: string;
            location: {
                longitude: number;
                latitude: number;
            };
        }

        interface CheckoutShippingMethodData {
            type: ShippingType;
            direct?: {
                id?: string;
                provider?: Sdk.ShippingProvider;
                category?: Sdk.ShippingCategory;
                amount?: Sdk.Price;
                address: ShippingMethodDataAddress;
            };
            pickup?: {
                id: string;
                provider?: Sdk.PickupProvider;
                amount: Sdk.Price;
                address: ShippingMethodDataPickupAddress;
            };
        }

        interface CheckoutShippingMethodContactData {
            id?: ContactId;
        }

        interface BillingContact {
            email?: string;
            phone?: string;
        }

        // Карта

        type MapZoom = number;

        interface MapPoint {
            latitude: number;
            longitude: number;
        }

        interface MapBounds {
            sw: MapPoint;
            ne: MapPoint;
        }

        interface MapPinState {
            visible: boolean;
        }

        interface MapTooltipState {
            visible: boolean;
            helper?: string;
            title?: string;
        }

        type MapPlacemarkId = string;

        interface MapPlacemark {
            id: MapPlacemarkId;
            coordinates: MapPoint;
            variant: 'PIN' | 'SMALL_TAIL' | 'SMALL_TAIL_RED';
            onClick?: Sys.CallbackFn1<MapPlacemark>;
        }

        interface StructureWithCoordinates {
            id: string;
            coordinates: MapPoint;
        }

        // Оплата
        type PaymentProcessData = Omit<sdk.ProcessEvent, 'type'>;

        // Сплит
        interface SplitPlan {
            id: string;
            sum: string;
            payments: Array<{
                status: 'expected' | 'coming' | 'paid' | 'failed' | 'canceled';
                datetime: Date;
                amount: string;
            }>;
        }

        type SplitFrameUrl = string;

        // Купоны

        type Coupon = string;
    }
}
