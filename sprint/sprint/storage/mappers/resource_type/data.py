from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper

from pay.sprint.sprint.storage.db.tables import resource_types as t_resource_types
from pay.sprint.sprint.storage.entities.resource_type import ResourceType


class ResourceTypeDataMapper(SelectableDataMapper):
    entity_class = ResourceType
    selectable = t_resource_types


class ResourceTypeDataDumper(TableDataDumper):
    entity_class = ResourceType
    table = t_resource_types
