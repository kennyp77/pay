from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID

from pay.sprint.sprint.storage.entities.base import Entity, autogenerate_uuid


@dataclass
class SprintGoal(Entity):
    title: str
    sprint_id: UUID
    sprint_goal_id: UUID = field(metadata=autogenerate_uuid(), default=None)
    parent_goal_id: Optional[UUID] = None
    done: bool = False
    deleted: bool = False
    created: datetime = field(default=None)
    updated: datetime = field(default=None)
