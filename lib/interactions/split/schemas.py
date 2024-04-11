from marshmallow import fields
from marshmallow_enum import EnumField

from pay.lib.interactions.split.entities import (
    YandexSplitConsumer,
    YandexSplitOrder,
    YandexSplitOrderCheckoutInfo,
    YandexSplitOrderMeta,
    YandexSplitOrderService,
    YandexSplitOrderServiceItem,
    YandexSplitOrderServiceType,
    YandexSplitOrderStatus,
    YandexSplitPayment,
    YandexSplitPaymentPlan,
    YandexSplitPaymentPlanDetails,
    YandexSplitPaymentPlanStatus,
    YandexSplitPaymentStatus,
)
from pay.lib.schemas.base import BaseDataClassSchema


class PaymentSchema(BaseDataClassSchema[YandexSplitPayment]):
    amount = fields.Decimal(required=True)
    datetime = fields.DateTime(required=True)
    status = EnumField(YandexSplitPaymentStatus, by_value=True, missing=None)


class PaymentPlanDetailsSchema(BaseDataClassSchema[YandexSplitPaymentPlanDetails]):
    deposit = fields.Decimal(missing=None)
    loan = fields.Decimal(missing=None)
    payments = fields.Nested(PaymentSchema, many=True, required=True)


class PaymentPlanSchema(BaseDataClassSchema[YandexSplitPaymentPlan]):
    id = fields.String(required=True)
    user_id = fields.String(required=True)
    class_name = fields.String(required=True)
    status = EnumField(YandexSplitPaymentPlanStatus, by_value=True, required=True)
    details = fields.Nested(PaymentPlanDetailsSchema, required=True)
    constructor = fields.String(missing=None)
    sum = fields.Decimal(missing=None)


class SplitOrderCheckoutInfoSchema(BaseDataClassSchema[YandexSplitOrderCheckoutInfo]):
    order_id = fields.String(required=True)
    checkout_url = fields.String(required=True)


class SplitOrderServiceItemSchema(BaseDataClassSchema[YandexSplitOrderServiceItem]):
    item_code = fields.String(required=True)
    count = fields.Integer(required=True)


class SplitOrderServiceSchema(BaseDataClassSchema[YandexSplitOrderService]):
    type = EnumField(YandexSplitOrderServiceType, by_value=True, required=True)
    currency = fields.String(required=True)
    amount = fields.Decimal(required=True, as_string=True)
    items = fields.Nested(SplitOrderServiceItemSchema, many=True)


class SplitOrderMetaSchema(BaseDataClassSchema[YandexSplitOrderMeta]):
    order_id = fields.String(required=False, missing=None)
    user_id = fields.String(required=False, missing=None)
    external_id = fields.String(required=False, missing=None)
    merchant_id = fields.String(required=False, missing=None)
    created_at = fields.DateTime(required=False, missing=None)


class SplitConsumerSchema(BaseDataClassSchema[YandexSplitConsumer]):
    title = fields.String(required=False, missing=None)
    id = fields.String(required=False, missing=None)


class SplitOrderSchema(BaseDataClassSchema[YandexSplitOrder]):
    services = fields.Nested(SplitOrderServiceSchema, many=True, required=True)
    status = EnumField(YandexSplitOrderStatus, by_value=True, required=True)
    order_meta = fields.Nested(SplitOrderMetaSchema, required=True)
    consumer = fields.Nested(SplitConsumerSchema, required=False)
