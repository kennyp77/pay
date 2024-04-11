from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from pay.sprint.sprint.storage.entities.base import Entity, autogenerate_uuid


@dataclass
class ResourceType(Entity):
    title: str
    code: str
    resource_type_id: UUID = field(metadata=autogenerate_uuid(), default=None)
    deleted: bool = False
    created: datetime = field(default=None)
    updated: datetime = field(default=None)
