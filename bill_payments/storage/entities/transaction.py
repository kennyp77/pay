from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

import yarl
from marshmallow import fields

from sendr_aiopg.storage.entity import JSONBEntity
from sendr_utils.schemas.base import BaseSchema

from pay.bill_payments.bill_payments.interactions.kazna.entities import PayerParams
from pay.bill_payments.bill_payments.storage.entities.base import Entity
from pay.bill_payments.bill_payments.storage.entities.enums import PaymentMethodType, TransactionStatus


@dataclass
class PayerData(JSONBEntity):
    class PayerDataSchema(BaseSchema):
        payer_full_name = fields.String()

    schema = PayerDataSchema
    payer_full_name: str

    def to_kazna_payer_params(self) -> PayerParams:
        return PayerParams(fio=self.payer_full_name)


@dataclass
class Transaction(Entity):
    order_id: UUID
    status: TransactionStatus
    amount: int
    external_payment_id: str
    payer_data: PayerData
    transaction_id: UUID = field(default_factory=uuid4)
    payment_method: PaymentMethodType = PaymentMethodType.YANDEX_PAY
    acs_url: Optional[yarl.URL] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None
