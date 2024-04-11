from datetime import datetime
from typing import List
from uuid import UUID

from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.sprint.sprint.storage.db.tables import stories as t_stories
from pay.sprint.sprint.storage.entities.story import Story
from pay.sprint.sprint.storage.mappers.base import BaseMapperCRUD
from pay.sprint.sprint.storage.mappers.story.data import StoryDataDumper, StoryDataMapper


class StoryMapper(BaseMapperCRUD[Story]):
    model = Story

    _builder = CRUDQueries(
        base=t_stories,
        id_fields=('story_id',),
        mapper_cls=StoryDataMapper,
        dumper_cls=StoryDataDumper,
    )

    async def find_by_ids(self, story_ids: List[UUID]) -> List[Story]:
        return await alist(self.find(filters={'story_id': lambda story_id: story_id.in_(story_ids)}))

    async def find_not_done(self, created_at_lt: datetime, project_ids: List[UUID]) -> List[Story]:
        filters = {
            'project_id': lambda project_id: project_id.in_(project_ids),
            'created': lambda created: created < created_at_lt,
            'done': False,
        }
        return await alist(self.find(filters=filters))
