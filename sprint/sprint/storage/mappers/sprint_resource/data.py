from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper

from pay.sprint.sprint.storage.db.tables import sprint_resources as t_sprint_resources
from pay.sprint.sprint.storage.entities.sprint_resource import SprintResource


class SprintResourceDataMapper(SelectableDataMapper):
    entity_class = SprintResource
    selectable = t_sprint_resources


class SprintResourceDataDumper(TableDataDumper):
    entity_class = SprintResource
    table = t_sprint_resources
