from typing import List
from uuid import UUID

from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.sprint.sprint.storage.db.tables import sprint_story_resources as t_sprint_story_resources
from pay.sprint.sprint.storage.entities.sprint_story_resource import SprintStoryResource
from pay.sprint.sprint.storage.mappers.base import BaseMapperCRUD
from pay.sprint.sprint.storage.mappers.sprint_story_resource.data import (
    SprintStoryResourceDataDumper,
    SprintStoryResourceDataMapper,
)


class SprintStoryResourceMapper(BaseMapperCRUD[SprintStoryResource]):
    model = SprintStoryResource

    _builder = CRUDQueries(
        base=t_sprint_story_resources,
        id_fields=('sprint_story_resource_id',),
        mapper_cls=SprintStoryResourceDataMapper,
        dumper_cls=SprintStoryResourceDataDumper,
    )

    async def find_for_sprints(self, sprint_ids: List[UUID]) -> List[SprintStoryResource]:
        return await alist(self.find(filters={'sprint_id': lambda sprint_id: sprint_id.in_(sprint_ids)}))
