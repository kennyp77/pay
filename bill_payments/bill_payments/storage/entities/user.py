from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from pay.bill_payments.bill_payments.storage.entities.base import Entity


@dataclass
class User(Entity):
    uid: int
    revision: int = 1
    synced_revision: int = 0
    syncing_revision: Optional[int] = None
    subscription_id: Optional[str] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None
