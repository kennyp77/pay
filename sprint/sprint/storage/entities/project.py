from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pay.sprint.sprint.storage.entities.base import Entity, autogenerate_uuid
from pay.sprint.sprint.storage.entities.story import Story


@dataclass
class Project(Entity):
    title: str
    responsible_uid: int
    project_id: UUID = field(metadata=autogenerate_uuid(), default=None)
    done: bool = False
    startrek_issue_key: Optional[str] = None
    yandex_goal_id: Optional[str] = None
    created: datetime = field(default=None)
    updated: datetime = field(default=None)

    stories: Optional[List[Story]] = None
