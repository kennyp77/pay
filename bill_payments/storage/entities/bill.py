from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal
from typing import Optional
from uuid import UUID

from sendr_utils import utcnow

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.interactions.kazna.entities import DepartmentType
from pay.bill_payments.bill_payments.storage.entities.base import Entity, autogenerate_uuid
from pay.bill_payments.bill_payments.storage.entities.enums import BillStatus

BILL_COMMISSION_MULTIPLIER = Decimal(settings.BILL_COMMISSION_MULTIPLIER)
BILL_COMMISSION_ADDITION = Decimal(settings.BILL_COMMISSION_ADDITION)
BILL_COMMISSION_MIN = Decimal(settings.BILL_COMMISSION_MIN)
assert 0 <= BILL_COMMISSION_MULTIPLIER < 1
assert 0 <= BILL_COMMISSION_MIN


@dataclass
class Bill(Entity):
    uid: int
    supplier_bill_id: str
    document_id: UUID
    status: BillStatus
    amount: int  # minor units
    amount_to_pay: int  # minor units
    bill_date: datetime
    bill_id: Optional[UUID] = field(default=None, metadata=autogenerate_uuid())
    purpose: Optional[str] = None
    kbk: Optional[str] = None
    oktmo: Optional[str] = None
    inn: Optional[str] = None
    kpp: Optional[str] = None
    bik: Optional[str] = None
    account_number: Optional[str] = None
    payee_name: Optional[str] = None
    payer_name: Optional[str] = None
    div_id: Optional[int] = None
    treasure_branch: Optional[str] = None
    dep_type: Optional[DepartmentType] = None
    discount_size: Optional[str] = None
    discount_date: Optional[date] = None
    legal_act: Optional[str] = None
    offense_name: Optional[str] = None
    offense_place: Optional[str] = None
    offense_date: Optional[datetime] = None
    paid_amount: Optional[int] = None  # minor units
    paid_date: Optional[datetime] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    @property
    def payment_deadline(self) -> datetime:
        return self.bill_date + timedelta(days=70)

    @property
    def discounted_amount(self) -> int:
        if self.discount_size is None or self.discount_date is None:
            return self.amount_to_pay
        if self.discount_date < utcnow().date():
            return self.amount_to_pay
        return (self.amount_to_pay * (100 - int(self.discount_size)) + 99) // 100

    @property
    def fee_amount(self) -> int:
        decimal_amount = Decimal(self.discounted_amount) / Decimal('100')
        decimal_fee = max(decimal_amount * BILL_COMMISSION_MULTIPLIER + BILL_COMMISSION_ADDITION, BILL_COMMISSION_MIN)
        fee = int((decimal_fee).quantize(Decimal('1.00'), rounding=ROUND_HALF_UP) * 100)
        return fee
