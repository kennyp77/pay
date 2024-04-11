from datetime import datetime
from typing import List
from uuid import UUID

from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.sprint.sprint.storage.db.tables import projects as t_projects
from pay.sprint.sprint.storage.entities.project import Project
from pay.sprint.sprint.storage.mappers.base import BaseMapperCRUD
from pay.sprint.sprint.storage.mappers.project.data import ProjectDataDumper, ProjectDataMapper


class ProjectMapper(BaseMapperCRUD[Project]):
    model = Project

    _builder = CRUDQueries(
        base=t_projects,
        id_fields=('project_id',),
        mapper_cls=ProjectDataMapper,
        dumper_cls=ProjectDataDumper,
    )

    async def find_by_ids(self, project_ids: List[UUID]) -> List[Project]:
        return await alist(self.find(filters={'project_id': lambda project_id: project_id.in_(project_ids)}))

    async def find_not_done(self, created_at_lt: datetime) -> List[Project]:
        return await alist(
            self.find(
                filters={
                    'created': lambda created: created < created_at_lt,
                    'done': False,
                },
            )
        )
