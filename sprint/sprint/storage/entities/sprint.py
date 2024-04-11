from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pay.sprint.sprint.storage.entities.base import Entity, autogenerate_uuid
from pay.sprint.sprint.storage.entities.sprint_goal import SprintGoal
from pay.sprint.sprint.storage.entities.sprint_resource import SprintResource


@dataclass
class Sprint(Entity):
    starts_at: datetime
    ends_at: datetime
    title: str
    sprint_id: UUID = field(metadata=autogenerate_uuid(), default=None)
    done: bool = False
    version: int = 1
    startrek_sprint_id: Optional[str] = None
    created: datetime = field(default=None)
    updated: datetime = field(default=None)

    goals: Optional[List[SprintGoal]] = None
    resources: Optional[List[SprintResource]] = None
