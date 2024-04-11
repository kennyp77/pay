from typing import List
from uuid import UUID

from sqlalchemy.dialects.postgresql import insert

from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.sprint.sprint.storage.db.tables import sprint_resources as t_sprint_resources
from pay.sprint.sprint.storage.entities.sprint_resource import SprintResource
from pay.sprint.sprint.storage.mappers.base import BaseMapperCRUD
from pay.sprint.sprint.storage.mappers.sprint_resource.data import SprintResourceDataDumper, SprintResourceDataMapper


class SprintResourceMapper(BaseMapperCRUD[SprintResource]):
    model = SprintResource

    _builder = CRUDQueries(
        base=t_sprint_resources,
        id_fields=('sprint_resource_id',),
        mapper_cls=SprintResourceDataMapper,
        dumper_cls=SprintResourceDataDumper,
    )

    async def find_by_sprint_ids(self, sprint_ids: List[UUID]) -> List[SprintResource]:
        return await alist(self.find(filters={'sprint_id': lambda sprint_id: sprint_id.in_(sprint_ids)}))

    async def create_or_update_by_sprint_and_resource_type(self, resource: SprintResource) -> SprintResource:
        dumped = self._builder._dumper(resource)
        insert_cols = {k: v for k, v in dumped.items() if k not in ('created', 'updated')}
        update_cols = {k: v for k, v in dumped.items() if k not in ('created', 'updated', 'sprint_resource_id')} + {''}
        row = await self._query_one(
            insert(t_sprint_resources)
                .values(**insert_cols)
                .on_conflict_do_update(
                    index_elements=(t_sprint_resources.c.sprint_id, t_sprint_resources.c.resource_type_id),
                    set_=update_cols,
                )
                .returning(*self._builder._mapper.columns)
        )
        return self._builder._mapper(row)
