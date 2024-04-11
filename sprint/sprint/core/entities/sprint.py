from dataclasses import dataclass, field
from datetime import datetime
from typing import List

from pay.sprint.sprint.storage.entities.project import Project
from pay.sprint.sprint.storage.entities.resource_type import ResourceType
from pay.sprint.sprint.storage.entities.sprint import Sprint
from pay.sprint.sprint.storage.entities.sprint_story_resource import SprintStoryResource


@dataclass
class GetSprintsRequest:
    from_: datetime = field(metadata={'load_from': 'from'})
    to: datetime


@dataclass
class GetSprintsResponse:
    sprints: List[Sprint]
    projects: List[Project]
    sprint_story_resources: List[SprintStoryResource]
    resource_types: List[ResourceType]


@dataclass
class CreateSprintRequest:
    starts_at: datetime
    ends_at: datetime
    title: str
