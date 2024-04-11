from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from pay.bill_payments.bill_payments.storage.entities.base import Entity
from pay.bill_payments.bill_payments.storage.entities.enums import OrderStatus


@dataclass
class Order(Entity):
    uid: int
    status: OrderStatus
    order_id: UUID = field(default_factory=uuid4)
    created: Optional[datetime] = None
    updated: Optional[datetime] = None
