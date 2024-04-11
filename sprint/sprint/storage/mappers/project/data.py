from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper

from pay.sprint.sprint.storage.db.tables import projects as t_projects
from pay.sprint.sprint.storage.entities.project import Project


class ProjectDataMapper(SelectableDataMapper):
    entity_class = Project
    selectable = t_projects


class ProjectDataDumper(TableDataDumper):
    entity_class = Project
    table = t_projects
