from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper

from pay.sprint.sprint.storage.db.tables import stories as t_stories
from pay.sprint.sprint.storage.entities.story import Story


class StoryDataMapper(SelectableDataMapper):
    entity_class = Story
    selectable = t_stories


class StoryDataDumper(TableDataDumper):
    entity_class = Story
    table = t_stories
