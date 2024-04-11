from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID


@dataclass
class UpsertSprintResourceRequest:
    sprint_id: UUID
    resource_type_id: UUID
    amount: Decimal
