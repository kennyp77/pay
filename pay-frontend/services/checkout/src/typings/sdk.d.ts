import type * as sdk from '@yandex-pay/sdk/src/typings';

declare global {
    namespace Sdk {
        type Price = sdk.Price;
        type Coupon = sdk.Coupon;

        type InitPaymentSheet = sdk.InitPaymentSheet;
        type PaymentSheet = sdk.PaymentSheet & { raw?: any };
        type Order = sdk.Order;
        type OrderItem = sdk.OrderItem;
        type PaymentMethod = sdk.PaymentMethod;
        type AdditionalFields = sdk.AdditionalFields;
        type RequiredFields = sdk.RequiredFields;

        type ShippingAddress = sdk.ShippingAddress;

        type ShippingOption = sdk.ShippingOption;
        type ShippingOptionId = sdk.ShippingOptionId;

        type GeoPoint = sdk.GeoPoint;
        type GeoBounds = sdk.GeoBounds;
        type PickupInfo = sdk.PickupInfo;
        type PickupPoint = sdk.PickupPoint;
        type PickupPointId = sdk.PickupPointId;
        type PickupProvider = sdk.PickupProvider;
        type PickupPointSchedule = sdk.PickupPointSchedule;

        type RequiredBillingContactFields = sdk.RequiredBillingContactFields;
        type RequiredShippingContactFields = sdk.RequiredShippingContactFields;
        type RequiredShippingTypes = sdk.RequiredShippingTypes;

        type BillingContactInfo = sdk.BillingContactInfo;
        type ShippingContactInfo = sdk.ShippingContactInfo;
        type ShippingMethodInfo = sdk.ShippingMethodInfo;
        type ShippingDirectInfo = sdk.ShippingDirectInfo;
        type ShippingPickupInfo = sdk.ShippingPickupInfo;
        type ShippingProvider = sdk.ShippingProvider;
        type ShippingCategory = sdk.ShippingCategory;

        type AdditionalInfo = sdk.AdditionalInfo;

        type PaymentToken = sdk.PaymentToken;
        type PaymentMethodInfo = sdk.PaymentMethodInfo;
        type CardPaymentMethodInfo = sdk.CardPaymentMethodInfo;
        type CashPaymentMethodInfo = sdk.CashPaymentMethodInfo;

        type ProcessEventData = Omit<sdk.ProcessEvent, 'type'>;
    }
}
