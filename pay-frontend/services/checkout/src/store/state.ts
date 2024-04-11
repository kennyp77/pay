import { asyncData } from '@trust/utils/async';
import { PaymentCashback } from '@trust/utils/payment-methods/typings';
import { RouterState } from 'connected-react-router';

import { USER_LOCATION_COORDS } from '../config';
import { getMinZoomForFetch } from '../helpers/pickup';
import { getEmptyUserState } from '../helpers/user-state';
import { AppError, AppPending, AppScreen, PaymentSheet, ShippingType } from '../typings';

import { initialPaymentState, PaymentState } from './checkout';
import { mapInitialState, MapState } from './map';

export interface RootState {
    router: RouterState;
    app: {
        screen: AppScreen;
        pending?: AppPending;
        error: AppError[];
        initialLoading: boolean;
        userState: Checkout.UserState;
        obSteps: Checkout.ObSteps;
        obCurrentStep: number;
    };
    // TODO: Rename checkout -> payment
    checkout: PaymentState;
    payment: {
        sheet: Sdk.PaymentSheet;
        cashback: Async.Data<PaymentCashback>;
        email: string;
    };
    paymentMethods: {
        list: Async.Data<Checkout.PaymentMethod[]>;
        selectedId: Checkout.PaymentMethodId;
    };
    split: {
        isAvailable: boolean;
        payWithSplit: boolean;
        splitPlan: Async.Data<Checkout.SplitPlan>;
        splitPayment?: {
            checkoutUrl: Checkout.SplitFrameUrl;
            processData: Checkout.PaymentProcessData;
            isSuccess: boolean;
            frameHeight: number;
            frameLoading: Async.Data<void>;
        };
    };
    contacts: {
        list: Async.Data<Checkout.Contact[]>;
        addContact: Async.Data<void>;
        editContact: Async.Data<void>;
        deleteContact: Async.Data<void>;
        selectedId: Checkout.ContactId;
    };
    addresses: {
        list: Async.Data<Checkout.Address[]>;
        addAddress: Async.Data<void>;
        editAddress: Async.Data<void>;
        deleteAddress: Async.Data<void>;
        selectedId: Checkout.AddressId;
        searchQuery: Checkout.SearchAddressQuery;
        searchSuggest: Async.Data<Checkout.SearchAddressSuggest[]>;
    };
    directShipping: {
        list: Async.Data<Sdk.ShippingOption[]>;
        selectedId: Sdk.ShippingOptionId;
        selectOption: Async.Data<void>;
        disable: boolean;
    };
    shipping: {
        type: ShippingType;
        pickup: {
            mapState: {
                center: Checkout.MapPoint;
                zoom: Checkout.MapZoom;
            };
            searchAddress: string;
            suggestAddress: Async.Data<string[]>;
            points: Async.Data<{ bounds?: Checkout.MapBounds; list: Sdk.PickupPoint[] }>;
            selectedId: Sdk.PickupPointId | null;
            selectedPoint: Sdk.PickupPoint | null;
            sendPickupPoint: Async.Data<void>;
        };
    };
    coupon: {
        setCoupon: Async.Data<Sdk.Coupon>;
        removeCoupon: Async.Data<void>;
        selected?: Sdk.Coupon;
    };
    map: MapState;
}

export const initialState: Omit<RootState, 'router'> = {
    app: {
        screen: AppScreen.Main,
        initialLoading: true,
        userState: getEmptyUserState(),
        obSteps: {} as any,
        obCurrentStep: 1,
        error: [],
    },
    checkout: initialPaymentState,
    payment: {
        // TODO: Заменить на валидную заглушку
        sheet: {} as PaymentSheet,
        cashback: asyncData.initial(),
        email: '',
    },
    paymentMethods: {
        list: asyncData.initial(),
        selectedId: '',
    },
    split: {
        isAvailable: false,
        payWithSplit: false,
        splitPlan: asyncData.initial(),
    },
    contacts: {
        list: asyncData.initial(),
        addContact: asyncData.initial(),
        editContact: asyncData.initial(),
        deleteContact: asyncData.initial(),
        selectedId: '',
    },
    addresses: {
        list: asyncData.initial(),
        addAddress: asyncData.initial(),
        editAddress: asyncData.initial(),
        deleteAddress: asyncData.initial(),
        selectedId: '',
        searchQuery: '',
        searchSuggest: asyncData.initial(),
    },
    // TODO: Убрать ветку directShipping в shipping.direct
    directShipping: {
        list: asyncData.initial(),
        selectedId: '',
        selectOption: asyncData.initial(),
        disable: false,
    },
    shipping: {
        type: ShippingType.Direct,
        pickup: {
            mapState: {
                center: USER_LOCATION_COORDS,
                zoom: getMinZoomForFetch(),
            },
            searchAddress: '',
            suggestAddress: asyncData.initial(),
            points: asyncData.initial(),
            selectedId: null,
            selectedPoint: null,
            sendPickupPoint: asyncData.initial(),
        },
    },
    coupon: {
        setCoupon: asyncData.initial(),
        removeCoupon: asyncData.initial(),
        selected: '',
    },
    map: mapInitialState,
};
