from marshmallow import fields
from marshmallow_enum import EnumField

from pay.bill_payments.bill_payments.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.bill_payments.bill_payments.core.actions.user.get import UserState
from pay.bill_payments.bill_payments.interactions.kazna.entities import DepartmentType
from pay.bill_payments.bill_payments.storage.entities.enums import BillStatus


class BillSchema(BaseSchema):
    SKIP_NONE: bool = True

    bill_id = fields.UUID(required=True)
    supplier_bill_id = fields.String(required=True)
    document_id = fields.String(required=True)
    status = EnumField(BillStatus, by_value=True, required=True)
    amount = fields.Integer(required=True)
    amount_to_pay = fields.Integer(required=True)
    bill_date = fields.DateTime(required=True)
    purpose = fields.String(required=False)
    kbk = fields.String(required=False)
    oktmo = fields.String(required=False)
    inn = fields.String(required=False)
    kpp = fields.String(required=False)
    bik = fields.String(required=False)
    account_number = fields.String(required=False)
    payee_name = fields.String(required=False)
    payer_name = fields.String(required=False)
    div_id = fields.Integer(required=False)
    treasure_branch = fields.String(required=False)
    dep_type = EnumField(DepartmentType, by_value=False, required=False)
    discount_size = fields.String(required=False)
    discount_date = fields.String(required=False)
    discounted_amount = fields.Integer(required=True)
    fee_amount = fields.Integer(required=True)
    legal_act = fields.String(required=False)
    offense_name = fields.String(required=False)
    offense_place = fields.String(required=False)
    offense_date = fields.DateTime(required=False)
    payment_deadline = fields.DateTime(required=False)
    paid_amount = fields.Integer(required=False)
    paid_date = fields.DateTime(required=False)


class BillsStateDataResponseSchema(BaseSchema):
    state = EnumField(UserState, by_value=True, required=True)
    bills = fields.Nested(BillSchema, many=True, required=True)


class BillStateResponseSchema(SuccessResponseSchema):
    data = fields.Nested(BillsStateDataResponseSchema)
