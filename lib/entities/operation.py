from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional
from uuid import UUID

from marshmallow import fields

from pay.lib.entities.enums import OperationStatus, OperationType


@dataclass
class Operation:
    operation_id: UUID
    merchant_id: UUID
    checkout_order_id: UUID
    order_id: str
    amount: Decimal
    operation_type: OperationType
    status: OperationStatus = OperationStatus.PENDING
    external_operation_id: Optional[str] = None
    params: Dict[str, Any] = field(
        default_factory=dict, metadata={'marshmallow_field': fields.Dict(keys=fields.String())}
    )
    reason: Optional[str] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None
