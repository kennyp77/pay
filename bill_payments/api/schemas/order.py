from marshmallow import fields, validate
from marshmallow_enum import EnumField

from pay.bill_payments.bill_payments.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.bill_payments.bill_payments.storage.entities.enums import OrderStatus


class OrderSchema(BaseSchema):
    order_id = fields.UUID(dump_only=True)
    status = EnumField(OrderStatus, dump_only=True)
    bill_ids = fields.List(fields.UUID(), required=True, validate=[validate.Length(min=1, max=100)])
    created = fields.DateTime(dump_only=True)
    updated = fields.DateTime(dump_only=True)


class OrderDataResponseSchema(BaseSchema):
    order = fields.Nested(OrderSchema)


class OrderResponseSchema(SuccessResponseSchema):
    data = fields.Nested(OrderDataResponseSchema)
