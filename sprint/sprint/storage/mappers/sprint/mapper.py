from datetime import datetime
from typing import List

from sqlalchemy import and_

from sendr_aiopg.query_builder import CRUDQueries, RelationDescription
from sendr_utils import alist

from pay.sprint.sprint.storage.db.tables import projects as t_projects
from pay.sprint.sprint.storage.db.tables import sprints as t_sprints
from pay.sprint.sprint.storage.entities.sprint import Sprint
from pay.sprint.sprint.storage.mappers.base import BaseMapperCRUD
from pay.sprint.sprint.storage.mappers.project.data import ProjectDataMapper
from pay.sprint.sprint.storage.mappers.sprint.data import SprintDataDumper, SprintDataMapper


class SprintMapper(BaseMapperCRUD[Sprint]):
    model = Sprint

    _related_projects = RelationDescription(
        name='project',
        base=t_sprints,
        related=t_projects,
        mapper_cls=ProjectDataMapper,
        base_cols=('sprint_id',),
        related_cols=('sprint_id',),
        outer_join=True,
    )

    _related_stories = RelationDescription(
        name='story',
        base=t_sprints,
        related=t_projects,
        mapper_cls=ProjectDataMapper,
        base_cols=('sprint_id',),
        related_cols=('sprint_id',),
        outer_join=True,
    )

    _builder = CRUDQueries(
        base=t_sprints,
        id_fields=('sprint_id',),
        mapper_cls=SprintDataMapper,
        dumper_cls=SprintDataDumper,
        related=(_related_projects,),
    )

    async def find_for_period(self, from_: datetime, to: datetime) -> List[Sprint]:
        return await alist(self.find(filters={'starts_at': lambda starts_at: and_(starts_at >= from_, starts_at < to)}))
