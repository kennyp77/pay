from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from sendr_utils import MISSING, MaybeMissing

from pay.bill_payments.bill_payments.storage.entities.base import Entity
from pay.bill_payments.bill_payments.storage.entities.bill import Bill


@dataclass
class BillOrder(Entity):
    bill_id: UUID
    order_id: UUID
    created: Optional[datetime] = None
    updated: Optional[datetime] = None
    bill: MaybeMissing[Bill] = MISSING
