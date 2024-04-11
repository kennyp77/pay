from marshmallow import fields
from marshmallow_enum import EnumField

from sendr_utils.schemas.decorators import skip_none_on_dump
from sendr_utils.schemas.fields import AmountField
from sendr_utils.schemas.validators import NonEmptyString

from pay.lib.entities.enums import PaymentItemType
from pay.lib.entities.payment_sheet import PaymentItemQuantity, PaymentOrder, PaymentOrderItem, PaymentOrderTotal
from pay.lib.schemas.base import BaseDataClassSchema


class PaymentItemQuantitySchema(BaseDataClassSchema[PaymentItemQuantity]):
    count = AmountField(required=True, format_enforced=True)
    label = fields.String(required=False, missing=None)


class PaymentOrderItemSchema(BaseDataClassSchema[PaymentOrderItem]):
    amount = AmountField(required=True, format_enforced=True)
    label = fields.String(required=True)
    quantity = fields.Nested(PaymentItemQuantitySchema, required=False)
    type = EnumField(PaymentItemType, required=False, by_value=True)


class PaymentOrderTotalSchema(BaseDataClassSchema[PaymentOrderTotal]):
    amount = AmountField(required=True, format_enforced=True)
    label = fields.String(required=False, allow_none=True, missing=None)


@skip_none_on_dump(field_names=['items'])
class PaymentOrderSchema(BaseDataClassSchema[PaymentOrder]):
    id = fields.String(required=True, validate=[NonEmptyString()])
    total = fields.Nested(PaymentOrderTotalSchema, required=True)
    items = fields.Nested(PaymentOrderItemSchema, required=False, many=True)
