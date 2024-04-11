from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper

from pay.sprint.sprint.storage.db.tables import sprints as t_sprints
from pay.sprint.sprint.storage.entities.sprint import Sprint


class SprintDataMapper(SelectableDataMapper):
    entity_class = Sprint
    selectable = t_sprints


class SprintDataDumper(TableDataDumper):
    entity_class = Sprint
    table = t_sprints
