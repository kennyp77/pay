import marshmallow_dataclass
from marshmallow import fields
from marshmallow_enum import EnumField

from sendr_utils.schemas import CamelCaseSchema

from pay.lib.entities.enums import ShippingMethodType
from pay.lib.entities.order import Order
from pay.lib.interactions.merchant.entities import (
    EventType,
    Location,
    MerchantCreateOrderRequest,
    MerchantCreateOrderV1Response,
    MerchantPickupOptionDetailsRequest,
    MerchantPickupOptionDetailsResponse,
    MerchantPickupOptionsRequest,
    MerchantPickupOptionsResponse,
    MerchantRenderOrderResponse,
    MerchantResponse,
    MerchantWebhookRequest,
    MerchantWebhookV1Request,
    PickupPoint,
    ReasonCode,
    ShippingMethodInfo,
    ShippingOption,
    TransactionStatus,
    UpdateTransactionStatusRequest,
)
from pay.lib.interactions.passport_addresses.schemas import AddressSchema as PassportAddressSchema
from pay.lib.interactions.passport_addresses.schemas import ContactSchema as PassportContactSchema
from pay.lib.schemas.base import BaseDataClassSchema
from pay.lib.schemas.checkout import PaymentOrderSchema


class BaseSchema(CamelCaseSchema):
    SKIP_NONE = True


class UpdateTransactionStatusRequestSchema(BaseSchema, BaseDataClassSchema[UpdateTransactionStatusRequest]):
    order_id = fields.String(required=True)
    status = EnumField(TransactionStatus, by_value=True, required=True)
    event_time = fields.DateTime(required=True)


class MerchantWebhookRequestSchema(BaseSchema, BaseDataClassSchema[MerchantWebhookRequest]):
    merchant_id = fields.UUID(required=True)
    event = EnumField(EventType, by_value=True, required=True)
    data = fields.Nested(
        UpdateTransactionStatusRequestSchema, required=True
    )  # TODO use OneOfSchema for multiple events


MerchantWebhookV1RequestSchema = marshmallow_dataclass.class_schema(MerchantWebhookV1Request, base_schema=BaseSchema)


class MerchantSuccessResponseSchema(BaseSchema, BaseDataClassSchema[MerchantResponse]):
    code = fields.Integer(required=True, missing=200)


class MerchantErrorResponseSchema(BaseSchema, BaseDataClassSchema[MerchantResponse]):
    code = fields.Integer(required=True)
    reason_code = EnumField(ReasonCode, requred=True)
    reason = fields.String(required=False, allow_none=True)


class ShippingOptionSchema(BaseSchema, BaseDataClassSchema[ShippingOption]):
    id = fields.String()


class PickupPointSchema(BaseSchema, BaseDataClassSchema[PickupPoint]):
    id = fields.String()


class LocationSchema(BaseSchema, BaseDataClassSchema[Location]):
    longitude = fields.Float(required=False)
    latitude = fields.Float(required=False)


# FIXME: почему не отнаследовано от BaseSchema?
class AddressSchema(PassportAddressSchema):
    class Meta:
        exclude = ('id', 'owner_service', 'type')


class ContactSchema(PassportContactSchema):
    class Meta:
        exclude = ('id', 'owner_service')


class ShippingMethodInfoSchema(BaseSchema, BaseDataClassSchema[ShippingMethodInfo]):
    type = EnumField(ShippingMethodType)
    shipping_address = fields.Nested(AddressSchema, required=False)
    shipping_option = fields.Nested(ShippingOptionSchema, required=False)
    pickup_point = fields.Nested(PickupPointSchema, required=False)


class MerchantCreateOrderRequestSchema(BaseSchema, BaseDataClassSchema[MerchantCreateOrderRequest]):
    merchant_id = fields.UUID(required=True)
    currency_code = fields.String(required=True)
    order = fields.Nested(PaymentOrderSchema, required=True)
    shipping_method_info = fields.Nested(ShippingMethodInfoSchema, required=False, allow_none=True)
    shipping_contact = fields.Nested(ContactSchema, required=False, allow_none=True)


class SkipNoneCamelCaseSchemaSchema(CamelCaseSchema):
    SKIP_NONE = True


BaseMerchantRenderOrderRequestSchema = marshmallow_dataclass.class_schema(
    Order, base_schema=SkipNoneCamelCaseSchemaSchema
)


class MerchantRenderOrderRequestSchema(BaseMerchantRenderOrderRequestSchema):  # type: ignore
    class Meta(BaseMerchantRenderOrderRequestSchema.Meta):  # type: ignore
        fields = (
            'merchant_id',
            'currency_code',
            'cart',
            'order_id',
            'payment_method',
            'shipping_address',
            'metadata',
        )
        exclude = ('shipping_address.id',)


BaseMerchantRenderOrderResponseSchema = marshmallow_dataclass.class_schema(
    MerchantRenderOrderResponse, base_schema=SkipNoneCamelCaseSchemaSchema
)


class MerchantRenderOrderResponseSchema(BaseMerchantRenderOrderResponseSchema):  # type: ignore
    class Meta(BaseMerchantRenderOrderResponseSchema.Meta):  # type: ignore
        exclude = (
            'data.cart.cart_id',
            'data.shipping.yandex_delivery.warehouse.address.id',
            'data.shipping.yandex_delivery.warehouse.contact.id',
            'data.shipping.yandex_delivery.warehouse.emergency_contact.id',
            'data.shipping.yandex_delivery.options',
        )


BaseMerchantCreateOrderV1RequestSchema = marshmallow_dataclass.class_schema(
    Order,
    base_schema=SkipNoneCamelCaseSchemaSchema,
)


class MerchantCreateOrderV1RequestSchema(BaseMerchantCreateOrderV1RequestSchema):  # type: ignore
    class Meta(BaseMerchantCreateOrderV1RequestSchema.Meta):  # type: ignore
        fields = (
            'merchant_id',
            'currency_code',
            'cart',
            'order_id',
            'order_amount',
            'payment_method',
            'shipping_method',
            'shipping_address',
            'shipping_contact',
            'billing_contact',
            'metadata',
        )
        exclude = ('shipping_address.id', 'shipping_contact.id', 'billing_contact.id')


MerchantCreateOrderV1ResponseSchema = marshmallow_dataclass.class_schema(
    MerchantCreateOrderV1Response, base_schema=CamelCaseSchema
)


MerchantPickupOptionsRequestSchema = marshmallow_dataclass.class_schema(
    MerchantPickupOptionsRequest, base_schema=SkipNoneCamelCaseSchemaSchema
)
MerchantPickupOptionsResponseSchema = marshmallow_dataclass.class_schema(
    MerchantPickupOptionsResponse, base_schema=SkipNoneCamelCaseSchemaSchema
)


MerchantPickupOptionDetailsRequestSchema = marshmallow_dataclass.class_schema(
    MerchantPickupOptionDetailsRequest, base_schema=SkipNoneCamelCaseSchemaSchema
)
MerchantPickupOptionDetailsResponseSchema = marshmallow_dataclass.class_schema(
    MerchantPickupOptionDetailsResponse, base_schema=SkipNoneCamelCaseSchemaSchema
)
