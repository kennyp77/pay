from marshmallow import fields
from marshmallow_enum import EnumField

from pay.bill_payments.bill_payments.core.actions.bill.create import BillNotification
from pay.bill_payments.bill_payments.interactions.kazna.entities import DepartmentType, DocumentCode, SinglePayerDoc
from pay.bill_payments.bill_payments.interactions.kazna.schemas import BaseDataClassSchema


class SinglePayerDocSchema(BaseDataClassSchema[SinglePayerDoc]):
    code = EnumField(DocumentCode, by_value=True, required=True)
    value = fields.String(required=True)


class BillNotificationRequestSchema(BaseDataClassSchema[BillNotification]):
    supplier_bill_id = fields.String(load_from='supplierBillID', required=True)
    subscription_id = fields.String(load_from='subscribe', required=True)
    payer_doc = fields.Nested(SinglePayerDocSchema, load_from='payerDoc', required=True)
    dep_type = EnumField(DepartmentType, load_from='depType', by_value=True, required=True)
    bill_date = fields.DateTime(load_from='billDate', required=True)
    amount_to_pay = fields.Integer(load_from='amountToPay', required=False)
    purpose = fields.String(required=True)
    kbk = fields.String(required=True)
    payee_name = fields.String(load_from='payeeName', required=True)
    amount = fields.Integer(required=True)
    # payer_identifier = fields.String(load_from='payerIdentifier', required=True)
    # Идентификатор документа. Сейчас не используется, так как нельзя еге получить изначально.
    # Матчим по code-value. Этот коммент тут, чтобы подсветить осознанность такого решения
    payer_name = fields.String(load_from='payerName', required=False)
    discount_size = fields.String(load_from='additionalDataDiscountSize', required=False)
    discount_date = fields.Date(load_from='additionalDataDiscountDate', required=False)
