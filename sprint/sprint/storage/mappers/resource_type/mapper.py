from typing import List

from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.sprint.sprint.storage.db.tables import resource_types as t_resource_types
from pay.sprint.sprint.storage.entities.resource_type import ResourceType
from pay.sprint.sprint.storage.mappers.base import BaseMapperCRUD
from pay.sprint.sprint.storage.mappers.resource_type.data import ResourceTypeDataDumper, ResourceTypeDataMapper


class ResourceTypeMapper(BaseMapperCRUD[ResourceType]):
    model = ResourceType

    _builder = CRUDQueries(
        base=t_resource_types,
        id_fields=('resource_type_id',),
        mapper_cls=ResourceTypeDataMapper,
        dumper_cls=ResourceTypeDataDumper,
    )

    async def find_not_deleted(self) -> List[ResourceType]:
        return await alist(self.find(filters={'deleted': False}))
