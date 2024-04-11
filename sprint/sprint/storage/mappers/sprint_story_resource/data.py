from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper

from pay.sprint.sprint.storage.db.tables import sprint_story_resources as t_sprint_story_resources
from pay.sprint.sprint.storage.entities.sprint_story_resource import SprintStoryResource


class SprintStoryResourceDataMapper(SelectableDataMapper):
    entity_class = SprintStoryResource
    selectable = t_sprint_story_resources


class SprintStoryResourceDataDumper(TableDataDumper):
    entity_class = SprintStoryResource
    table = t_sprint_story_resources
